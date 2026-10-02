-- =============================================================
-- ARCHEION LEGAL OPS — Migración segura v2: Eliminar usuario público
-- Archivo: db/migrations/002_remove_public_user.sql
-- =============================================================
-- Esta migración elimina el usuario público y reasigna sus
-- expedientes a un usuario real específico.
-- 
-- IMPORTANTE: Antes de ejecutar, crea el usuario real con:
-- INSERT INTO users (email, password_hash, account_status)
-- VALUES ('tu@email.com', 'hash_bcrypt', 'active');
-- 
-- Luego obtén su ID y reemplaza 'TU_USER_ID_AQUI' abajo.
-- 
-- MEJORAS v2:
-- - Manejo de colisiones de referencias
-- - Backup automático antes de modificar
-- - Verificación de integridad referencial
-- =============================================================

BEGIN;

-- =============================================================
-- PASO 0: CONFIGURACIÓN
-- =============================================================
-- Reemplaza 'TU_USER_ID_AQUI' con el UUID del usuario real destino
-- Ejemplo: '12345678-1234-1234-1234-123456789012'

DO $$
DECLARE
  target_user_id UUID := 'TU_USER_ID_AQUI'::UUID;
  public_user_id UUID := '00000000-0000-0000-0000-000000000000'::UUID;
  public_user_count INTEGER;
  target_user_count INTEGER;
  collision_count INTEGER;
BEGIN
  -- =============================================================
  -- PASO 1: Verificar que existe el usuario público
  -- =============================================================
  SELECT COUNT(*) INTO public_user_count
  FROM users
  WHERE id = public_user_id;
  
  IF public_user_count = 0 THEN
    RAISE NOTICE 'El usuario público no existe. Nada que migrar.';
    RETURN;
  END IF;
  
  RAISE NOTICE 'Usuario público encontrado. Iniciando migración...';
  
  -- =============================================================
  -- PASO 2: Verificar que el usuario destino existe
  -- =============================================================
  SELECT COUNT(*) INTO target_user_count
  FROM users
  WHERE id = target_user_id;
  
  IF target_user_count = 0 THEN
    RAISE EXCEPTION 'El usuario destino % no existe. Créalo primero.', target_user_id;
  END IF;
  
  RAISE NOTICE 'Usuario destino verificado: %', target_user_id;
  
  -- =============================================================
  -- PASO 3: Detectar colisiones de referencias
  -- =============================================================
  SELECT COUNT(*) INTO collision_count
  FROM cases c1
  JOIN cases c2 ON c1.referencia = c2.referencia
  WHERE c1.user_id = public_user_id
    AND c2.user_id = target_user_id;
  
  IF collision_count > 0 THEN
    RAISE NOTICE 'Se detectaron % colisiones de referencias.', collision_count;
    RAISE NOTICE 'Las referencias del usuario público serán renombradas con sufijo _migrated.';
    
    -- Renombrar referencias conflictivas del usuario público
    UPDATE cases
    SET referencia = referencia || '_migrated_' || EXTRACT(EPOCH FROM created_at)::BIGINT
    WHERE user_id = public_user_id
      AND referencia IN (
        SELECT c1.referencia
        FROM cases c1
        JOIN cases c2 ON c1.referencia = c2.referencia
        WHERE c1.user_id = public_user_id
          AND c2.user_id = target_user_id
      );
    
    RAISE NOTICE 'Referencias conflictivas renombradas.';
  END IF;
  
  -- =============================================================
  -- PASO 4: Crear backup de los datos a migrar
  -- =============================================================
  CREATE TEMP TABLE backup_cases AS
  SELECT * FROM cases WHERE user_id = public_user_id;
  
  CREATE TEMP TABLE backup_case_events AS
  SELECT * FROM case_events WHERE user_id = public_user_id;
  
  RAISE NOTICE 'Backup creado: % expedientes, % actuaciones',
    (SELECT COUNT(*) FROM backup_cases),
    (SELECT COUNT(*) FROM backup_case_events);
  
  -- =============================================================
  -- PASO 5: Reasignar expedientes
  -- =============================================================
  UPDATE cases
  SET user_id = target_user_id
  WHERE user_id = public_user_id;
  
  RAISE NOTICE 'Expedientes reasignados: %', (SELECT COUNT(*) FROM backup_cases);
  
  -- =============================================================
  -- PASO 6: Reasignar actuaciones
  -- =============================================================
  UPDATE case_events
  SET user_id = target_user_id
  WHERE user_id = public_user_id;
  
  RAISE NOTICE 'Actuaciones reasignadas: %', (SELECT COUNT(*) FROM backup_case_events);
  
  -- =============================================================
  -- PASO 7: Eliminar eventos de seguridad del usuario público
  -- =============================================================
  DELETE FROM security_events
  WHERE user_id = public_user_id;
  
  -- =============================================================
  -- PASO 8: Eliminar el usuario público
  -- =============================================================
  DELETE FROM users
  WHERE id = public_user_id;
  
  -- =============================================================
  -- PASO 9: Verificación final
  -- =============================================================
  DECLARE
    remaining_cases INTEGER;
    remaining_events INTEGER;
    remaining_user INTEGER;
  BEGIN
    SELECT COUNT(*) INTO remaining_cases
    FROM cases
    WHERE user_id = public_user_id;
    
    SELECT COUNT(*) INTO remaining_events
    FROM case_events
    WHERE user_id = public_user_id;
    
    SELECT COUNT(*) INTO remaining_user
    FROM users
    WHERE id = public_user_id;
    
    IF remaining_cases > 0 OR remaining_events > 0 OR remaining_user > 0 THEN
      RAISE EXCEPTION 'Migración incompleta. Quedan datos del usuario público.';
    END IF;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Migración completada exitosamente.';
    RAISE NOTICE 'Expedientes migrados: %', (SELECT COUNT(*) FROM backup_cases);
    RAISE NOTICE 'Actuaciones migradas: %', (SELECT COUNT(*) FROM backup_case_events);
    RAISE NOTICE '========================================';
  END;
  
END $$;

COMMIT;

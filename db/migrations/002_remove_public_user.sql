-- =============================================================
-- ARCHEION LEGAL OPS — Migración segura: Eliminar usuario público
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
-- =============================================================

BEGIN;

-- 1. Verificar que existe el usuario público
DO $$
DECLARE
  public_user_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO public_user_count
  FROM users
  WHERE id = '00000000-0000-0000-0000-000000000000';
  
  IF public_user_count = 0 THEN
    RAISE NOTICE 'El usuario público no existe. Nada que migrar.';
    RETURN;
  END IF;
  
  RAISE NOTICE 'Usuario público encontrado. Iniciando migración...';
END $$;

-- 2. REASIGNAR EXPEDIENTES
-- Reemplaza 'TU_USER_ID_AQUI' con el UUID del usuario real destino
-- Ejemplo: '12345678-1234-1234-1234-123456789012'

-- Verificar que el usuario destino existe
DO $$
DECLARE
  target_user_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO target_user_count
  FROM users
  WHERE id = 'TU_USER_ID_AQUI';
  
  IF target_user_count = 0 THEN
    RAISE EXCEPTION 'El usuario destino TU_USER_ID_AQUI no existe. Créalo primero.';
  END IF;
END $$;

-- Reasignar expedientes del usuario público al usuario real
UPDATE cases
SET user_id = 'TU_USER_ID_AQUI'
WHERE user_id = '00000000-0000-0000-0000-000000000000';

-- Reasignar actuaciones del usuario público al usuario real
UPDATE case_events
SET user_id = 'TU_USER_ID_AQUI'
WHERE user_id = '00000000-0000-0000-0000-000000000000';

-- 3. ELIMINAR EVENTOS DE SEGURIDAD DEL USUARIO PÚBLICO
DELETE FROM security_events
WHERE user_id = '00000000-0000-0000-0000-000000000000';

-- 4. ELIMINAR EL USUARIO PÚBLICO
DELETE FROM users
WHERE id = '00000000-0000-0000-0000-000000000000';

-- 5. VERIFICACIÓN
DO $$
DECLARE
  remaining_cases INTEGER;
  remaining_events INTEGER;
  remaining_user INTEGER;
BEGIN
  SELECT COUNT(*) INTO remaining_cases
  FROM cases
  WHERE user_id = '00000000-0000-0000-0000-000000000000';
  
  SELECT COUNT(*) INTO remaining_events
  FROM case_events
  WHERE user_id = '00000000-0000-0000-0000-000000000000';
  
  SELECT COUNT(*) INTO remaining_user
  FROM users
  WHERE id = '00000000-0000-0000-0000-000000000000';
  
  IF remaining_cases > 0 OR remaining_events > 0 OR remaining_user > 0 THEN
    RAISE EXCEPTION 'Migración incompleta. Quedan datos del usuario público.';
  END IF;
  
  RAISE NOTICE 'Migración completada exitosamente.';
END $$;

COMMIT;

-- ============================================================
-- Script de verificación de políticas RLS
-- Ejecutar en Supabase SQL Editor para comprobar la seguridad
-- ============================================================

-- 1. Verificar que RLS está activado en las tablas principales
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('expedientes', 'actuaciones', 'documentos')
ORDER BY tablename;

-- 2. Listar todas las políticas RLS existentes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Verificar que las políticas filtran por auth.uid()
SELECT 
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
  AND (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%')
ORDER BY tablename;

-- 4. Contar usuarios en auth.users
SELECT count(*) as total_users FROM auth.users;

-- 5. Verificar que el usuario autorizado existe
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at
FROM auth.users 
WHERE email = 'pergolessi9@gmail.com';

-- 6. Contar expedientes por usuario
SELECT 
  u.email,
  count(e.id) as total_expedientes
FROM auth.users u
LEFT JOIN expedientes e ON e.user_id = u.id
GROUP BY u.email
ORDER BY total_expedientes DESC;

-- 7. Simular consulta como usuario no autenticado (debe devolver 0 filas)
-- NOTA: Esta consulta solo funciona si se ejecuta con el rol 'anon'
-- SET LOCAL ROLE anon;
-- SELECT count(*) FROM expedientes;
-- RESET ROLE;

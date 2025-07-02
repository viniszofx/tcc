-- Script SQL para criar a política RLS do bucket avatars
-- Execute este script manualmente no Supabase SQL Editor

-- Função para criar a política RLS para o bucket avatars
CREATE OR REPLACE FUNCTION create_avatars_policy()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Inserir política para permitir upload de avatares
  INSERT INTO storage.policies (id, bucket_id, name, operation, definition)
  VALUES (
    'avatars_upload_policy',
    'avatars',
    'Users can upload their own avatars',
    'INSERT',
    '(bucket_id = ''avatars'') AND (auth.uid()::text = (storage.foldername(name))[1])'
  ) ON CONFLICT (id) DO NOTHING;

  -- Inserir política para permitir leitura de avatares
  INSERT INTO storage.policies (id, bucket_id, name, operation, definition)
  VALUES (
    'avatars_select_policy',
    'avatars',
    'Anyone can view avatars',
    'SELECT',
    '(bucket_id = ''avatars'')'
  ) ON CONFLICT (id) DO NOTHING;

  -- Inserir política para permitir atualização de avatares
  INSERT INTO storage.policies (id, bucket_id, name, operation, definition)
  VALUES (
    'avatars_update_policy',
    'avatars',
    'Users can update their own avatars',
    'UPDATE',
    '(bucket_id = ''avatars'') AND (auth.uid()::text = (storage.foldername(name))[1])'
  ) ON CONFLICT (id) DO NOTHING;

  -- Inserir política para permitir deleção de avatares
  INSERT INTO storage.policies (id, bucket_id, name, operation, definition)
  VALUES (
    'avatars_delete_policy',
    'avatars',
    'Users can delete their own avatars',
    'DELETE',
    '(bucket_id = ''avatars'') AND (auth.uid()::text = (storage.foldername(name))[1])'
  ) ON CONFLICT (id) DO NOTHING;

END;
$$;

-- Habilitar RLS para o bucket storage
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
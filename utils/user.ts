import { Usuario } from '@/lib/interface';

export const user: Usuario = [
    {
        usuario_id: '1',
        nome: 'admin',
        papel: 'admin',
        email: 'admin',
        senha_hash: 'admin',
        habilitado: true,
        organizacao_id: '1',
        campus_id: '1',
        comissao_id: '1',
        data_inicio: '2023-07-01'
    },
    {
        usuario_id: '2',
        nome: 'user',
        papel: 'operador',
        email: 'user',
        senha_hash: 'user',
        habilitado: true,
        organizacao_id: '1',
        campus_id: '1',
        comissao_id: '1',
        data_inicio: '2023-07-01'
    },
    {
        usuario_id: '3',
        nome: 'presidente',
        papel: 'presidente',
        email: 'presidente',
        senha_hash: 'presidente',
        habilitado: true,
        organizacao_id: '1',
        campus_id: '1',
        comissao_id: '1',
        data_inicio: '2023-07-01'
    }
]
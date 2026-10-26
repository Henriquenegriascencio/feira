import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Substitua com as suas credenciais do painel Supabase (Project Settings > API)
const SUPABASE_URL = 'https://SEU_PROJETO.supabase.co';
const SUPABASE_ANON_KEY = 'SUA_CHAVE_ANONIMA_AQUI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper para verificar sessão e redirecionar
export async function checarSessao(papeisPermitidos = []) {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        window.location.href = 'login.html';
        return null;
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

    if (papeisPermitidos.length > 0 && !papeisPermitidos.includes(profile?.role)) {
        if (profile?.role === 'admin') window.location.href = 'admin.html';
        else window.location.href = 'feirante.html';
        return null;
    }

    return { session, profile };
}
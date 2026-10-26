import { supabase } from './supabaseClient.js';

const form = document.getElementById('loginForm');
const errorEl = document.getElementById('errorMessage');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.classList.add('hidden');
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        errorEl.textContent = 'Erro ao fazer login: ' + error.message;
        errorEl.classList.remove('hidden');
        return;
    }

    // Buscar perfil do usuário para redirecionar
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

    if (profile?.role === 'admin') {
        window.location.href = 'admin.html';
    } else {
        window.location.href = 'feirante.html';
    }
});
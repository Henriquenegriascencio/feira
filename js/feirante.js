import { supabase, checarSessao } from './supabaseClient.js';

async function init() {
    const userContext = await checarSessao(['feirante']);
    if (!userContext) return;

    document.getElementById('feiranteNome').textContent = userContext.profile.nome;

    carregarHistorico(userContext.profile.id);

    document.getElementById('btnLogout').addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = 'login.html';
    });
}

async function carregarHistorico(feiranteId) {
    const { data: recebimentos } = await supabase
        .from('recebimentos')
        .select('*, feiras(data_feira)')
        .eq('feirante_id', feiranteId);

    const tbody = document.getElementById('tabelaFeirante');
    tbody.innerHTML = '';

    recebimentos?.forEach(r => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="p-2">${r.feiras?.data_feira || '-'}</td>
            <td class="p-2 font-bold">R$ ${Number(r.valor_devido).toFixed(2)}</td>
            <td class="p-2">
                <span class="px-2 py-0.5 rounded text-[10px] font-semibold ${
                    r.status === 'PAGO' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    r.status === 'PENDENTE' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-400'
                }">${r.status}</span>
            </td>
            <td class="p-2">
                ${r.status === 'PENDENTE' ? `<button onclick="alert('Chave PIX: feiradalua@pix.com.br')" class="bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 px-2 py-1 rounded text-xs">Pagar via PIX</button>` : '-'}
            </td>
        `;
        tbody.appendChild(row);
    });
}

init();
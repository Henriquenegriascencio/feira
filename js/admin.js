import { supabase, checarSessao } from './supabaseClient.js';

let usuarioAtual = null;

async function init() {
    usuarioAtual = await checarSessao(['admin']);
    if (!usuarioAtual) return;

    carregarMetricas();
    carregarPendentes();

    document.getElementById('btnLogout').addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = 'login.html';
    });
}

async function carregarMetricas() {
    const { data: feiras } = await supabase.from('feiras').select('id');
    const { data: recebimentos } = await supabase.from('recebimentos').select('valor_pago, forma_pagamento').eq('status', 'PAGO');
    const { data: despesas } = await supabase.from('despesas').select('valor');

    const totalFeiras = feiras ? feiras.length : 0;
    let totalDinheiro = 0;
    let totalPix = 0;

    recebimentos?.forEach(r => {
        if (r.forma_pagamento === 'DINHEIRO') totalDinheiro += Number(r.valor_pago);
        if (r.forma_pagamento === 'PIX') totalPix += Number(r.valor_pago);
    });

    const totalDespesas = despesas?.reduce((acc, d) => acc + Number(d.valor), 0) || 0;
    const saldoLiquido = (totalDinheiro + totalPix) - totalDespesas;

    document.getElementById('totalFeiras').textContent = totalFeiras;
    document.getElementById('totalDinheiro').textContent = `R$ ${totalDinheiro.toFixed(2)}`;
    document.getElementById('totalPix').textContent = `R$ ${totalPix.toFixed(2)}`;
    document.getElementById('saldoLiquido').textContent = `R$ ${saldoLiquido.toFixed(2)}`;
}

async function carregarPendentes() {
    const { data: pendentes } = await supabase
        .from('recebimentos')
        .select('*, feiras(data_feira), profiles(nome, whatsapp)')
        .eq('status', 'PENDENTE');

    const tbody = document.getElementById('tabelaPendentes');
    tbody.innerHTML = '';

    pendentes?.forEach(p => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="p-2">${p.feiras?.data_feira || '-'}</td>
            <td class="p-2 font-medium text-slate-100">${p.profiles?.nome || 'Feirante'}</td>
            <td class="p-2">${p.profiles?.whatsapp || 'Sem telefone'}</td>
            <td class="p-2 text-red-400 font-bold">R$ ${Number(p.valor_devido).toFixed(2)}</td>
            <td class="p-2">
                <a href="https://wa.me/${p.profiles?.whatsapp || ''}?text=Olá! Lembramos da pendência de R$ ${p.valor_devido} referente à feira de ${p.feiras?.data_feira}" target="_blank" class="bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 px-2 py-1 rounded text-xs hover:bg-emerald-600/50">Cobrar Via WhatsApp</a>
            </td>
        `;
        tbody.appendChild(row);
    });
}

init();
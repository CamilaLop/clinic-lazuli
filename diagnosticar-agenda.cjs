/** Execute na pasta do site: node diagnosticar-agenda.cjs
 * Consulta somente horários; não cria solicitações e não imprime a chave.
 */
async function diagnosticar({ env = process.env, request = globalThis.fetch, log = console.log } = {}) {
  const endpoint = env.GOOGLE_SCRIPT_URL;
  const secret = env.AGENDA_SECRET;
  log('GOOGLE_SCRIPT_URL preenchida: ' + (endpoint ? 'sim' : 'não'));
  log('AGENDA_SECRET preenchida: ' + (secret ? 'sim' : 'não'));
  if (!endpoint || !secret) {
    log('RESULTADO: VARIAVEL_AUSENTE. Confira .env.local na pasta de package.json.');
    return 'VARIAVEL_AUSENTE';
  }
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(endpoint)) {
    log('RESULTADO: URL_INVALIDA. Use a URL completa do App da Web, terminada em /exec, sem colchetes, espaços ou formatação de link.');
    return 'URL_INVALIDA';
  }
  if (secret !== secret.trim()) log('AVISO: a chave contém espaços nas pontas. Compare com o valor salvo nas propriedades do script.');
  const date = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  try {
    const response = await request(endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'availability', secret, professional: 'Aline Reis', date, modality: 'presencial' }),
      redirect: 'follow', signal: AbortSignal.timeout(15000)
    });
    log('HTTP recebido: ' + response.status);
    if (!response.ok) {
      log('RESULTADO: HTTP_ERRO. Confira a URL e a implantação: executar como Eu, acesso Qualquer pessoa.');
      return 'HTTP_ERRO';
    }
    let data;
    try { data = JSON.parse(await response.text()); }
    catch {
      log('RESULTADO: RESPOSTA_NAO_JSON. O Google não retornou a resposta esperada. Confira o acesso Qualquer pessoa, a URL /exec e a versão publicada.');
      return 'RESPOSTA_NAO_JSON';
    }
    if (data && data.ok === false) {
      const messages = {
        unauthorized: 'CHAVE_RECUSADA. Confira se AGENDA_SECRET existe nas propriedades do Apps Script e se é idêntica à chave de .env.local.',
        invalid_data: 'DADOS_RECUSADOS. Confira se a implantação usa o código atual da Lazuli, com Aline Reis e a modalidade presencial.',
        service_unavailable: 'ERRO_INTERNO_DO_SCRIPT. Execute setupAgenda e confira SPREADSHEET_ID, as abas Horarios/Solicitacoes e os cabeçalhos.'
      };
      if (Object.hasOwn(messages, data.error)) {
        log('RESULTADO: ' + messages[data.error]);
        return data.error;
      }
    }
    if (data && data.ok === true && Array.isArray(data.slots) && data.slots.every(slot => typeof slot === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(slot))) {
      log('RESULTADO: CONEXAO_OK. A URL, a chave e a leitura da planilha funcionaram.');
      log('Horários disponíveis hoje para Aline Reis (presencial): ' + (data.slots.join(', ') || 'nenhum'));
      return 'CONEXAO_OK';
    }
    log('RESULTADO: RESPOSTA_INESPERADA. Confira se a URL pertence à implantação do script da agenda Lazuli.');
    return 'RESPOSTA_INESPERADA';
  } catch (error) {
    const timedOut = error && ['TimeoutError', 'AbortError'].includes(error.name);
    log('RESULTADO: ' + (timedOut ? 'TEMPO_ESGOTADO. O Google não respondeu em 15 segundos.' : 'FALHA_DE_REDE. Não foi possível completar a chamada ao Google.'));
    return timedOut ? 'TEMPO_ESGOTADO' : 'FALHA_DE_REDE';
  }
}

module.exports = { diagnosticar };
if (require.main === module) {
  try {
    const { loadEnvConfig } = require(require.resolve('@next/env', { paths: [process.cwd()] }));
    loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
    diagnosticar().then(result => { if (result !== 'CONEXAO_OK') process.exitCode = 1; });
  } catch {
    console.log('Abra o terminal na pasta do site, onde fica package.json. Instale as dependências com npm install e execute node diagnosticar-agenda.cjs novamente.');
    process.exitCode = 1;
  }
}

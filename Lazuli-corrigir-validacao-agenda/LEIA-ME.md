# Atualizar a validação da agenda Lazuli

A mensagem “Confira os campos e escolha uma data a partir de hoje” era usada pela API para qualquer campo inválido. Ela não mostrava se o problema era data, WhatsApp, profissional, horário, autorização ou identificação da solicitação.

Esta atualização informa o campo recusado e posiciona o foco nele. O formulário e a API usam a mesma validação. A referência de data continua sendo o fuso de São Paulo.

## Aplicar no seu computador

1. Extraia o ZIP.
2. Copie a pasta **Lazuli-corrigir-validacao-agenda** para dentro do seu projeto, ao lado de `package.json` e `.env.local`.
3. Pare o servidor local com **Control + C** no terminal onde ele está rodando.
4. Na pasta do projeto, execute:

   ```bash
   node Lazuli-corrigir-validacao-agenda/aplicar.cjs
   npm run dev
   ```

5. Atualize a página no navegador e tente solicitar o atendimento novamente. Use o calendário para conferir o dia, mês e ano, escolha um horário disponível e marque a autorização.

O instalador atualiza somente `lib/agenda.ts`, `app/api/agenda/route.ts` e `components/modal-schedule.tsx`. Ele cria uma cópia desses três arquivos em uma pasta `backup-validacao-agenda-...`. Sua configuração em `.env.local` é preservada.

Se preferir aplicar manualmente, copie cada arquivo da pasta `arquivos` para o caminho correspondente no projeto. Substitua somente esses arquivos, preservando o restante de cada pasta.

## Conferir o resultado

Se aparecer um erro, a mensagem agora indicará o que corrigir. Quando a data estiver no passado, ela mostrará a data mínima considerada pelo servidor. Se a data mínima não coincidir com a data atual em São Paulo, confira o relógio do computador que executa o site.

Se aparecer novamente a mensagem antiga, confira se a atualização foi aplicada no mesmo projeto do terminal, reinicie `npm run dev` e atualize a página.

Compartilhe somente a nova mensagem de erro caso ainda haja um bloqueio. Não é necessário enviar a chave `AGENDA_SECRET` nem dados reais de pacientes.

## Validação realizada

TypeScript, 23 testes automatizados e compilação de produção passaram. Os testes incluem data de hoje em São Paulo após a mudança do dia em UTC, rejeição de dados inválidos antes de chamar o Google, mensagens por campo, foco após a resposta do servidor e reenvio em telas de computador e celular. A conexão real com sua implantação do Google depende da configuração no seu computador e no Apps Script.

# Conectar a agenda Lazuli ao Google Planilhas

O projeto está preparado para consultar horários reais e registrar solicitações. A conexão será ativada depois que você publicar o Apps Script e configurar as duas variáveis do servidor.

O fluxo é: visitante → API do site → Google Apps Script → planilha privada.

Não exige Google Calendar. Neste projeto, a planilha é a fonte dos horários, e a clínica confirma os atendimentos manualmente pelo WhatsApp.

## 1. Abrir a planilha

A planilha já foi criada no Google Planilhas: [Agenda Lazuli · 3 profissionais e 2 salas](https://docs.google.com/spreadsheets/d/1CjjF8bk4uhSJZsHeNQWtUKt37bVwtZWqlaNH06XWkiQ/edit).

Ela foi preparada para Aline Reis, Géssyca Martins e Laura Casanova, com **Sala 1** e **Sala 2**, no fuso de São Paulo. As datas, fórmulas e listas de escolha foram verificadas depois da conversão. Mantenha o acesso restrito.

Ela contém três abas: `Agenda` (visão diária), `Horarios` (escala das profissionais e salas) e `Solicitacoes` (pedidos recebidos). A escala inicial vai de 05 a 30 de outubro de 2026, de segunda a sexta, das 9h às 20h. As sessões têm 50 minutos e 10 minutos de intervalo. O último início é às 19h.

Os 440 horários são uma proposta editável e começam com `ativo = não`. Revise a disponibilidade de cada profissional, almoço, folgas e feriados. Troque para `sim` apenas os horários que devem aparecer no site. A escala não presume que a clínica abra em feriados.

Na aba `Agenda`, altere `Dia consultado` para ver a distribuição diária. Os campos `Sessão (min)` e `Intervalo (min)` alimentam a duração dos horários propostos. Reservas já registradas preservam a duração usada no momento do pedido.

## 2. Instalar o código

1. Na planilha, abra **Extensões → Apps Script**.
2. Apague o código de exemplo do arquivo `Código.gs`.
3. Copie todo o conteúdo de `integrations/agenda-google.gs` para esse arquivo.
4. Salve o projeto.
5. No seletor de funções, escolha **setupAgenda** e clique em **Executar**.
6. Autorize o acesso à sua planilha na sua conta Google.

A função reconhece `Horarios` e `Solicitacoes`, salva o ID da planilha e define o fuso de São Paulo. Ela preserva todos os formatos existentes e não tenta definir formatos de número ou data, tanto na inicialização quanto no envio das solicitações. Use a planilha fornecida, que já está formatada. Não altere a ordem dos cabeçalhos. Na versão anterior, ela acrescenta as novas colunas de sala e duração sem apagar os dados. Solicitações presenciais antigas pendentes ou confirmadas precisam ter uma sala válida e duração preenchidas antes de liberar novos horários naquele período.

No registro de execução, a versão atual mostra `Versão da agenda: SEM_FORMATACAO_2026_10_05` e, ao concluir, `Agenda inicializada com sucesso.`. Se o erro de formato continuar, procure `setNumberFormat` em todos os arquivos `.gs` do projeto: a versão atual não contém essa chamada. Verifique também se existe outra função `setupAgenda` em outro arquivo e mantenha apenas a versão atual dessa função.

## 3. Definir a chave da integração

Gere uma chave aleatória no terminal:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

No editor Apps Script, abra **Configurações do projeto → Propriedades do script → Adicionar propriedade**.

| Propriedade | Valor |
| --- | --- |
| `AGENDA_SECRET` | A chave gerada acima |
| `SPREADSHEET_ID` | Preenchido automaticamente por `setupAgenda` |

Não coloque a chave no código público ou em uma variável com prefixo `NEXT_PUBLIC_`. O servidor do site envia essa chave ao script; o navegador não a recebe.

## 4. Cadastrar os horários

Na aba `Horarios`, preencha uma linha para cada horário, profissional e modalidade.

| profissional | data | horario | modalidade | ativo | sala | duracao_min | intervalo_min |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Aline Reis | 2026-10-20 | 09:00 | presencial | sim | Sala 1 | 50 | 10 |
| Géssyca Martins | 2026-10-20 | 09:00 | presencial | sim | Sala 2 | 50 | 10 |
| Laura Casanova | 2026-10-20 | 10:00 | presencial | sim | Sala 1 | 50 | 10 |

Os exemplos são ilustrativos: cadastre apenas dias e horários de atendimento que você realmente pretende oferecer.

- Use exatamente os nomes das profissionais cadastrados no site.
- Formato da data: `AAAA-MM-DD`.
- Formato do horário: `HH:mm`, sempre com dois dígitos.
- Modalidade: `presencial` ou `online` em letras minúsculas.
- Para oferecer o horário, `ativo` deve ser `sim`, `TRUE` ou `1`.
- Para ocultá-lo, use `não`, `FALSE` ou deixe vazio.
- Cada linha vale para uma data específica. O projeto não cria recorrência semanal automaticamente.
- Presencial exige `Sala 1` ou `Sala 2`. Online pode ficar sem sala; se você preencher uma sala, ela também será reservada.
- O site considera a duração da sessão e o intervalo ao bloquear a profissional e a sala. Assim, uma reserva das 9h às 10h também bloqueia um início às 9h30 na mesma sala ou com a mesma profissional.
- A sala é escolhida automaticamente a partir da linha de disponibilidade. A pessoa não precisa escolher a sala no formulário.
- Horários fora de segunda a sexta, das 9h às 20h, não são oferecidos por esta versão do script. Para alterar o funcionamento, ajuste também os limites de `freeOptions_`.
- Nas abas de dados, datas e horários são valores de planilha, com formatos `yyyy-mm-dd` e `hh:mm`. Não converta a coluna inteira para texto.
- As colunas de conflito indicam quantas outras linhas ativas se sobrepõem. Em `Horarios`, zero indica que a escala ativa não duplica sala ou profissional; em `Solicitacoes`, o controle considera pedidos pendentes e confirmados.
- As fórmulas estão preparadas para 500 linhas em cada aba. Ao ultrapassar esse limite, estenda as fórmulas e os intervalos de referência na planilha. O script usa todas as linhas cadastradas, mas as visualizações precisam dessa extensão.
- Se uma profissional atende presencial e online no mesmo horário, podem existir duas linhas. Uma solicitação bloqueia o horário nas duas modalidades.
- Os horários seguem o fuso `America/Sao_Paulo`. Horários já passados no dia atual não são oferecidos.

## 5. Publicar o Apps Script

1. Clique em **Implantar → Nova implantação**.
2. Em **Selecionar tipo**, escolha **App da Web**.
3. Em **Executar como**, selecione **Eu**.
4. Em **Quem pode acessar**, selecione **Qualquer pessoa**, para que o servidor possa fazer a chamada sem login interativo.
5. Clique em **Implantar** e copie o endereço que termina em `/exec`.

A planilha continua privada. A URL do app aceita somente requisições com a chave correta, e a resposta da consulta contém apenas horários; nenhuma lista de pessoas é enviada ao visitante.

Se a sua conta Workspace não disponibilizar a opção “Qualquer pessoa”, a política da organização pode impedir esse método. Nesse caso, solicite orientação ao administrador da conta antes de escolher outro método de integração.

O script só implementa POST. Abrir a URL `/exec` diretamente no navegador não é o teste da conexão. Use o formulário do site depois do passo 6. Não use a URL de teste `/dev` na hospedagem.

## 6. Configurar o site

Para testar localmente, copie `.env.example` para `.env.local` e substitua os exemplos:

```env
GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/SEU_DEPLOYMENT_ID/exec
AGENDA_SECRET=SUA_CHAVE_ALEATORIA
```

O valor de `AGENDA_SECRET` deve ser idêntico ao das propriedades do script.

Reinicie `npm run dev` depois de alterar o arquivo. Na hospedagem, adicione as mesmas duas variáveis em **Environment Variables / Variáveis de ambiente** e publique novamente o site.

Esta integração usa uma rota de servidor Next.js. A hospedagem precisa executar Next.js com Node.js; copiar o projeto para uma pasta estática `public_html` não executa a API. Use uma hospedagem que suporte Next.js ou configure uma aplicação Node compatível no seu provedor.

## 7. Testar antes de usar

1. Cadastre na planilha um horário futuro para uma profissional e modalidade.
2. No site, clique em **Consultar agenda**.
3. Selecione a mesma profissional, data e modalidade.
4. Confirme que somente os horários cadastrados e ativos aparecem.
5. Preencha um nome de teste e um WhatsApp autorizado para o teste.
6. Selecione o horário, marque a autorização e envie.
7. Na aba `Solicitacoes`, confira a nova linha com status `pendente`, sala, duração, intervalo e fim da reserva.
8. Abra a agenda novamente: esse horário deve ter desaparecido.
9. Altere o status dessa solicitação para `cancelado` e consulte novamente: o horário volta a aparecer.
10. Faça uma segunda solicitação com outra profissional na mesma sala e em um horário que se sobreponha: esse horário não deve ser oferecido. Teste a outra sala no mesmo período: ela continua disponível para uma profissional livre.
11. Apague somente os valores de entrada da linha de teste; preserve as fórmulas de controle.

O site só exibe a mensagem de sucesso após uma resposta positiva do script. Os testes incluídos no projeto verificam as regras com uma planilha simulada; este teste na sua conta confirma a conexão real.

## 8. Administrar as solicitações

| Status na aba `Solicitacoes` | Efeito |
| --- | --- |
| `pendente` | Mantém o horário bloqueado enquanto a clínica responde |
| `confirmado` | Mantém o horário bloqueado após confirmação |
| `cancelado` | Libera o horário, se ainda estiver ativo em `Horarios` |

Para recusar ou encerrar uma solicitação, use `cancelado`. A planilha não envia mensagens por si só. A confirmação com a pessoa é manual pelo WhatsApp informado.

Uma solicitação pendente permanece bloqueada até a equipe alterar o status. Não existe expiração automática. Cadastre compromissos externos como indisponíveis na aba `Horarios`, ou eles continuarão sendo oferecidos pelo site.

Para cadastrar um compromisso externo manualmente em `Solicitacoes`, preencha um ID único, profissional, data, início, modalidade, status, sala, duração e intervalo. Evite editar somente o horário de uma solicitação recebida pelo site; ao remarcá-la, confira também sala, duração e fim da reserva. As fórmulas de conflito ajudam a revisar alterações manuais.

O formulário registra apenas informações de contato e agendamento. Ele não pede motivo da terapia, objetivo, diagnóstico ou história clínica.

## Se algo não funcionar

| Situação | O que conferir |
| --- | --- |
| “Não é possível definir o formato de número das células em uma coluna com tipo” | Substitua todo o `Código.gs` pela versão atual de `integrations/agenda-google.gs`, salve e execute `setupAgenda` novamente. Confirme o marcador `SEM_FORMATACAO_2026_10_05` no registro. A versão atual não chama `setNumberFormat`; confira se outro arquivo `.gs` ainda contém chamadas antigas ou outra função `setupAgenda`. Se já publicou o app, implante uma nova versão. |
| Aparece “Preferência de horário” | As duas variáveis do servidor ainda não estão configuradas; o formulário usa o modo de contato por WhatsApp |
| Nenhum horário aparece | Nomes, data, modalidade e coluna `ativo`; confira se o horário já passou ou está bloqueado por uma solicitação |
| Erro ao consultar ou enviar | URL `/exec`, chave idêntica, autorização do script e configuração da implantação |
| Mudou o código do script e nada mudou | Abra **Implantar → Gerenciar implantações → Editar → Nova versão → Implantar** |
| Solicitação registrada após uma falha de rede | Tente novamente sem alterar os campos: o mesmo ID evita uma segunda linha |

O serviço usa as cotas do Google Apps Script. O projeto não inclui integração automática com Google Calendar, mensagens automáticas, pagamento ou área administrativa no site.

## Referências oficiais

- [Google Apps Script: aplicativos da Web](https://developers.google.com/apps-script/guides/web?hl=pt-br)
- [Propriedades do script](https://developers.google.com/apps-script/guides/properties?hl=pt-br)
- [Bloqueios para acesso simultâneo](https://developers.google.com/apps-script/reference/lock/lock-service)
- [Retorno de JSON e redirecionamentos do Content Service](https://developers.google.com/apps-script/guides/content)

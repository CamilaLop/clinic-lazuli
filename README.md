# Lazuli — Espaço Psicoterapêutico

Versão editorial em Next.js: fundo de papel, azul profundo, títulos em Cormorant Garamond, texto em Manrope, fotografias existentes e interações suaves.

O scroll reveal acompanha a rolagem com entradas de texto em sequência, fade e deslocamento de 26 px. As fotos aparecem com abertura do recorte e zoom suave de 1,07 para 1. Cada entrada acontece uma vez, sem reposicionar o conteúdo. A preferência de movimento reduzido desativa as animações, e o conteúdo continua visível quando o JavaScript está desativado.

## Abrir o projeto

Use Node.js 20.9 ou superior.

```bash
npm ci
npm run dev
```

Abra http://localhost:3000.

```bash
npm run typecheck
npm test
npm run build
npm start
```

O `package.json` foi alinhado ao Next.js 16.2.2 que já estava no lockfile enviado. O ZIP final contém código-fonte; não inclui dependências nem cache de compilação.

## Conectar a agenda ao Google Planilhas

O passo a passo completo está em **docs/CONECTAR-GOOGLE-PLANILHAS.md**.

Já estão incluídos:

- Formulário de contato e solicitação de atendimento.
- Rota privada de integração em `app/api/agenda/route.ts`.
- Script pronto para instalar em `integrations/agenda-google.gs`.
- Exemplo das variáveis do servidor em `.env.example`.
- Consulta de horários por profissional, data e modalidade.
- Duas salas físicas, sessões de 50 minutos com 10 minutos de intervalo, e controle de sobreposição de sala e profissional.
- Bloqueio de conflitos, reenvio sem duplicar linhas e retorno de erro sem falsa confirmação.

Sem as variáveis, a agenda funciona como consulta de preferência via WhatsApp, desde que os números reais estejam configurados. Os contatos de exemplo ficam ocultos ou desativados. A [planilha nativa já foi criada](https://docs.google.com/spreadsheets/d/1CjjF8bk4uhSJZsHeNQWtUKt37bVwtZWqlaNH06XWkiQ/edit); a conexão com o site será ativada após a implantação do Apps Script e a configuração das variáveis.

## O que você precisa completar

1. Substitua os links e números de exemplo em `data/site-data.ts`.
2. Adicione as fotos de Géssyca e Laura; seus monogramas estão sendo usados enquanto não há fotos reais.
3. Confira endereço, registros e áreas de atuação antes de publicar.
4. Configure a planilha e as variáveis conforme o guia.
   A escala inicial contém 440 horários de 05 a 30 de outubro de 2026, de segunda a sexta, das 9h às 20h. Revise e ative somente a disponibilidade real de cada profissional.
5. Publique em uma hospedagem que execute Next.js e suas rotas de servidor.

Para inserir uma foto, copie o arquivo para `public/professionals/` e atualize `photo` e `imageAlt` na profissional correspondente. Retire “placeholder” do caminho para que o retrato apareça.

## Arquivos de personalização

| Conteúdo | Arquivo |
| --- | --- |
| Profissionais, contatos e textos dos atendimentos | `data/site-data.ts` |
| Paleta, dimensões e comportamento responsivo | `app/globals.css` |
| Duração, deslocamento e recorte do scroll reveal | `components/reveal.tsx` |
| Título e descrição para busca | `app/layout.tsx` |
| Imagem principal | `public/images/atendimento.jpg` |
| Formulário | `components/modal-schedule.tsx` |
| Agenda Google | `integrations/agenda-google.gs` |

Os arquivos originais de imagens foram mantidos. As fontes são locais, com suas licenças em `public/fonts/`.

A pasta `docs/preview/`, quando presente, contém capturas da versão revisada para computador e celular.

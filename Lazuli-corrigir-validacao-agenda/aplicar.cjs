const fs = require('node:fs');
const path = require('node:path');
const project = process.cwd();
const files = ['lib/agenda.ts', 'app/api/agenda/route.ts', 'components/modal-schedule.tsx'];
let backup;
let applying = false;
try {
  const manifest = JSON.parse(fs.readFileSync(path.join(project, 'package.json'), 'utf8'));
  if (manifest.name !== 'lazuli-editorial') throw new Error('Execute este comando na pasta do projeto Lazuli, onde está o package.json.');
  for (const file of files) {
    if (!fs.statSync(path.join(project, file)).isFile() || !fs.statSync(path.join(__dirname, 'arquivos', file)).isFile()) throw new Error(`Arquivo não encontrado: ${file}.`);
  }
  backup = path.join(project, 'backup-validacao-agenda-' + new Date().toISOString().replace(/[:.]/g, '-'));
  for (const file of files) {
    const target = path.join(backup, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(project, file), target);
  }
  applying = true;
  for (const file of files) fs.copyFileSync(path.join(__dirname, 'arquivos', file), path.join(project, file));
  console.log('Atualização aplicada: 3 arquivos da validação da agenda.');
  console.log('Cópia dos arquivos anteriores: ' + path.basename(backup));
  console.log('Reinicie o site com npm run dev e tente enviar a solicitação novamente.');
} catch (error) {
  if (applying) {
    for (const file of files) {
      try { fs.copyFileSync(path.join(backup, file), path.join(project, file)); }
      catch { console.error(`Restaure manualmente ${file} a partir de ${backup}.`); }
    }
  }
  console.error('Não foi possível aplicar a atualização: ' + error.message);
  process.exitCode = 1;
}

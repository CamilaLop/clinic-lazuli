const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync('integrations/agenda-google.gs', 'utf8');
function fixture({typed = true, formatError = null, rangeError = null, typedError = 'Não é possível definir o formato de número das células em uma coluna com tipo.'} = {}) {
  const future = new Date(Date.now() + 86400000 * 2);
  while ([0,6].includes(future.getUTCDay())) future.setUTCDate(future.getUTCDate()+1);
  const date = future.toISOString().slice(0,10);
  let held = false;
  const requests = [['id','criado_em','nome','whatsapp','profissional','data','horario','modalidade','status','consentimento','sala','duracao_min','intervalo_min','fim_reserva']];
  const slots = [['profissional','data','horario','modalidade','ativo','sala','duracao_min','intervalo_min'], ['Aline Reis', date, '09:00','presencial','sim','Sala 1',50,10], ['Aline Reis', date, '10:00','presencial',true,'Sala 1',50,10], ['Aline Reis', date, '11:00','online','sim','',50,10]];
  const formats = [];
  const logs = [];
  const properties = {AGENDA_SECRET:'test-secret',SPREADSHEET_ID:'sheet-id'};
  let timezone;
  const sheet = (name, data, typedColumns) => ({
    getDataRange: () => ({getValues:()=>data}),
    getLastRow:()=>data.length,
    setFrozenRows() {}, autoResizeColumns() {},
    getRange(row, column = 1, rowCount = 1, columnCount = 1) {
      if (rangeError) throw new Error(rangeError);
      if (typeof row === 'string') {
        const match = /^([A-Z]):([A-Z])$/.exec(row);
        assert.ok(match, 'mock expects a bounded cell range or column range');
        column = match[1].charCodeAt(0)-64;
        columnCount = match[2].charCodeAt(0)-64-column+1;
        row = 1; rowCount = 1000;
      }
      return {
        getValues:()=>Array.from({length:rowCount},(_,r)=>Array.from({length:columnCount},(_,c)=>data[row+r-1]?.[column+c-1]??'')),
        setNumberFormat(format) {
          const blocked = typed && row+rowCount>2 && typedColumns.some(c=>c>=column&&c<column+columnCount);
          formats.push({name,row,column,rowCount,columnCount,format,blocked});
          if (formatError) throw new Error(formatError);
          if (blocked) throw new Error(typedError);
          return this;
        },
        setValues(values) {
          if (row>1) assert.ok(held, 'request writes must hold script lock');
          for(let r=0;r<values.length;r++) {
            data[row+r-1]??=[];
            for(let c=0;c<values[r].length;c++) data[row+r-1][column+c-1]=values[r][c];
          }
          return this;
        },
        setBackground() {return this},setFontColor() {return this},setFontWeight() {return this}
      };
    }
  });
  const sheets = {Horarios:sheet('Horarios',slots,[1,2,4,5,6]),Solicitacoes:sheet('Solicitacoes',requests,[5,6,8,9,11])};
  const book = {getSheetByName:name=>sheets[name],getId:()=> 'sheet-id',setSpreadsheetTimeZone:value=>{timezone=value}};
  const cache = new Map();
  const context = vm.createContext({
    console: {log: message=>logs.push(message)},
    PropertiesService: {getScriptProperties:()=>({getProperty:k=>properties[k],setProperty:(k,v)=>{properties[k]=v}})},
    SpreadsheetApp: {openById:()=>book,getActiveSpreadsheet:()=>book,flush:()=>{}},
    LockService: {getScriptLock:()=>({waitLock:()=>{held=true},hasLock:()=>held,releaseLock:()=>{held=false}})},
    CacheService: {getScriptCache:()=>({get:k=>cache.get(k),put:(k,v)=>cache.set(k,v)})},
    Utilities: {formatDate:(d,tz,pattern)=>pattern==='HH:mm'?'00:00':d.toISOString().slice(0,10)},
    ContentService: {MimeType:{JSON:'json'},createTextOutput:s=>({setMimeType:()=>JSON.parse(s)})}
  });
  vm.runInContext(source,context);
  const send = payload=>context.doPost({postData:{contents:JSON.stringify({secret:'test-secret',...payload})}});
  const appointment = {id:'11111111-1111-4111-8111-111111111111',name:'Pessoa Teste',whatsapp:'22999999999',professional:'Aline Reis',date,time:'09:00',modality:'presencial',consent:true};
  return {send,appointment,requests,slots,context,date,formats,logs,properties,getTimezone:()=>timezone};
}
test('setupAgenda supports typed tables without overwriting the schedule',()=>{
  const f=fixture();
  const before=JSON.stringify([f.slots,f.requests]);
  f.properties.SPREADSHEET_ID='old-id';
  assert.doesNotThrow(()=>f.context.setupAgenda());
  assert.equal(f.properties.SPREADSHEET_ID,'sheet-id');
  assert.equal(f.getTimezone(),'America/Sao_Paulo');
  assert.equal(JSON.stringify([f.slots,f.requests]),before);
  assert.equal(f.formats.length,0);
  assert.deepEqual(f.logs,['Versão da agenda: SEM_FORMATACAO_2026_10_05','Agenda inicializada com sucesso.']);
});
test('setupAgenda succeeds when every number-format operation is forbidden',()=>{
  const f=fixture({formatError:'Não é possível definir o formato de número das células em uma coluna com tipo.'});
  assert.doesNotThrow(()=>f.context.setupAgenda());
  assert.equal(f.formats.length,0);
});
test('setupAgenda preserves plain-column formats and propagates access errors',()=>{
  const plain=fixture({typed:false});
  plain.context.setupAgenda();
  assert.equal(plain.formats.length,0);
  const denied=fixture({rangeError:'Você não tem permissão para editar esta planilha.'});
  assert.throws(()=>denied.context.setupAgenda(),/permissão/);
  assert.ok(!denied.logs.includes('Agenda inicializada com sucesso.'));
});
test('a typed-table request preserves date values, phone text and control formulas',()=>{
  const f=fixture({formatError:'Não é possível definir o formato de número das células em uma coluna com tipo.'});
  f.appointment.whatsapp='02299999999';
  f.requests.push([...Array(14).fill(''),'=controle_sala','=controle_prof']);
  assert.equal(f.send({action:'request',appointment:f.appointment}).ok,true);
  assert.equal(Object.prototype.toString.call(f.requests[1][5]),'[object Date]');
  assert.equal(f.requests[1][5].toISOString(),f.date+'T03:00:00.000Z');
  assert.equal(f.requests[1][3],f.appointment.whatsapp);
  assert.equal(f.requests[1][6],9/24);
  assert.equal(f.requests[1][13],10/24);
  assert.deepEqual(f.requests[1].slice(14),['=controle_sala','=controle_prof']);
  assert.equal(f.formats.length,0);
  assert.equal(f.send({action:'request',appointment:f.appointment}).ok,true);
  assert.equal(f.requests.filter(row=>row[0]===f.appointment.id).length,1);
});
test('availability returns only active slots for the selected modality, without patient data',()=>{
  const f=fixture(); const data=f.send({action:'availability',...f.appointment});
  assert.equal(data.ok,true); assert.equal(JSON.stringify(data.slots),JSON.stringify(['09:00','10:00']));
  assert.equal(Object.keys(data).join(','),'ok,slots');
});
test('request writes under a lock; pending slot disappears and rejects a second request',()=>{
  const f=fixture();assert.equal(f.send({action:'request',appointment:f.appointment}).ok,true);
  assert.equal(f.requests.length,2);assert.equal(f.requests[1][8],'pendente');
  assert.equal(JSON.stringify(f.send({action:'availability',...f.appointment}).slots),JSON.stringify(['10:00']));
  assert.equal(f.send({action:'request',appointment:{...f.appointment,id:'22222222-2222-4222-8222-222222222222'}}).error,'slot_unavailable');
  assert.equal(f.requests.length,2);
});
test('retry is idempotent; reusing the ID with another payload fails',()=>{
  const f=fixture();f.send({action:'request',appointment:f.appointment});
  assert.equal(f.send({action:'request',appointment:f.appointment}).ok,true);
  assert.equal(f.requests.length,2);
  assert.equal(f.send({action:'request',appointment:{...f.appointment,name:'Outra pessoa'}}).error,'invalid_data');
});
test('cancelled requests release their slot; confirmed requests keep it blocked',()=>{
  const f=fixture();f.send({action:'request',appointment:f.appointment});f.requests[1][8]='cancelado';
  assert.ok(f.send({action:'availability',...f.appointment}).slots.includes('09:00'));
  f.requests[1][8]='confirmado';assert.ok(!f.send({action:'availability',...f.appointment}).slots.includes('09:00'));
});
test('bad secret, past dates, invalid dates, and missing consent cannot write',()=>{
  const f=fixture();assert.equal(f.context.doPost({postData:{contents:JSON.stringify({secret:'wrong',action:'request',appointment:f.appointment})}}).error,'unauthorized');
  for(const change of [{date:'2020-01-01'},{date:'2099-02-30'},{consent:false},{professional:'Desconhecida'}]) assert.equal(f.send({action:'request',appointment:{...f.appointment,...change}}).error,'invalid_data');
  assert.equal(f.requests.length,1);
});
test('names starting with a spreadsheet formula are stored as text',()=>{
  const f=fixture();assert.equal(f.send({action:'request',appointment:{...f.appointment,name:'=IMPORTXML("x")'}}).ok,true);
  assert.ok(f.requests[1][2].startsWith("'="));
  f.requests[1][2] = f.requests[1][2].slice(1);
  assert.equal(f.send({action:'request',appointment:{...f.appointment,name:'=IMPORTXML("x")'}}).ok,true);
  assert.equal(f.requests.length,2);
});
test('a request blocks the same professional and time across both modalities',()=>{
  const f=fixture();
  f.slots.push(['Aline Reis', f.date, '09:00', 'online', 'sim','',50,10]);
  f.send({action:'request',appointment:f.appointment});
  assert.ok(!f.send({action:'availability',...f.appointment,modality:'online'}).slots.includes('09:00'));
});
test('different professionals cannot book the same room at the same time',()=>{
  const f=fixture();
  f.slots.push(['Laura Casanova',f.date,'09:00','presencial','sim','Sala 1',50,10]);
  f.send({action:'request',appointment:f.appointment});
  const second={...f.appointment,id:'22222222-2222-4222-8222-222222222222',professional:'Laura Casanova'};
  assert.equal(f.send({action:'request',appointment:second}).error,'slot_unavailable');
});
test('two simultaneous requests use the two rooms; a third request is rejected',()=>{
  const f=fixture();
  f.slots.push(['Géssyca Martins',f.date,'09:00','presencial','sim','Sala 2',50,10],['Laura Casanova',f.date,'09:00','presencial','sim','Sala 1',50,10],['Laura Casanova',f.date,'09:00','presencial','sim','Sala 2',50,10]);
  assert.equal(f.send({action:'request',appointment:f.appointment}).ok,true);
  assert.equal(f.send({action:'request',appointment:{...f.appointment,id:'22222222-2222-4222-8222-222222222222',professional:'Géssyca Martins'}}).ok,true);
  assert.equal(f.send({action:'request',appointment:{...f.appointment,id:'33333333-3333-4333-8333-333333333333',professional:'Laura Casanova'}}).error,'slot_unavailable');
  assert.equal(f.requests[1][10],'Sala 1');assert.equal(f.requests[2][10],'Sala 2');
});
test('the interval blocks overlapping starts and permits the exact next boundary',()=>{
  const f=fixture();f.send({action:'request',appointment:f.appointment});
  f.slots.push(['Laura Casanova',f.date,'09:50','presencial','sim','Sala 1',50,10],['Laura Casanova',f.date,'10:00','presencial','sim','Sala 1',50,10]);
  assert.equal(JSON.stringify(f.send({action:'availability',...f.appointment,professional:'Laura Casanova'}).slots),JSON.stringify(['10:00']));
});
test('a longer session blocks overlapping reservations even with different start times',()=>{
  const f=fixture();f.slots[1][6]=90;
  f.send({action:'request',appointment:f.appointment});
  assert.ok(!f.send({action:'availability',...f.appointment}).slots.includes('10:00'));
});
test('pre-filled empty formula rows do not push a new request to the bottom',()=>{
  const f=fixture();for(let i=0;i<1000;i++)f.requests.push(Array(16).fill(''));
  assert.equal(f.send({action:'request',appointment:f.appointment}).ok,true);
  assert.equal(f.requests[1][0],f.appointment.id);assert.equal(f.requests.filter(r=>r[0]===f.appointment.id).length,1);
});
test('onsite offers require a known room and fit inside weekday opening hours',()=>{
  const f=fixture();
  f.slots.push(['Aline Reis',f.date,'08:00','presencial','sim','Sala 1',50,10],['Aline Reis',f.date,'19:30','presencial','sim','Sala 1',50,10],['Aline Reis',f.date,'12:00','presencial','sim','Sala 3',50,10]);
  assert.equal(JSON.stringify(f.send({action:'availability',...f.appointment}).slots),JSON.stringify(['09:00','10:00']));
});

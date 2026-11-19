/* ICF University, static course page: the learner flow.

   Mirrors the ICF University learner pages (services/university_web/templates/learn*.html, player.js,
   quiz.js): six steps, a video you can rewind but not skip ahead in, chapters that open in order, a
   test one question at a time with two attempts and a review between them, then the acknowledgment.

   What a static page cannot do, and does not pretend to: there is no server, so nothing is recorded
   in ICF University from here. Progress lives in this browser (localStorage). The finished record is
   shown, printed or downloaded and handed to a supervisor, who imports it
   (tools/icf_university/import_external_completion.py). The skip-ahead rule is enforced here only;
   ICF University enforces it on its server. */
(function () {
  'use strict';
  var Core = window.ICFUCore;
  var app = document.getElementById('app');
  var PREVIEW = /[?&]preview=1\b/.test(location.search);

  // ---------------------------------------------------------------------------------------------
  // words. English and Spanish are written from the ICF University learner pages and their Spanish
  // catalogue (services/university_web/i18n.py, i18n_es.py). Spanish needs review by a
  // Spanish-speaking supervisor.
  // ---------------------------------------------------------------------------------------------
  var T = {
    en: {
      by: 'by', footer: 'ICF University by ICF Mercantile', home: 'ICF University home',
      pctComplete: '% complete', next: 'Next:', courseProgress: 'Course progress', courseSteps: 'Course steps',
      stepOf: 'Step {n} of {t}: {s}', locked: 'Locked', back: '‹ Back', fwd: 'Next ›',
      version: 'Version {v}', draftNote: 'Draft course version. Not released in ICF University yet.',
      previewNote: 'Learner preview. Nothing here is recorded.',
      st_ASSIGNED: 'Assigned', st_IN_PROGRESS: 'In progress', st_AWAITING_ACKNOWLEDGMENT: 'Awaiting acknowledgment',
      st_SUPERVISOR_REVIEW_REQUIRED: 'Supervisor review required', st_COMPLETED: 'Completed',
      nx_watch: 'Watch chapter {n}, {t}', nx_test: 'Knowledge test', nx_review: 'Review before your next attempt',
      nx_ack: 'Final acknowledgment', nx_done: 'Complete', nx_sup: 'Supervisor review required',
      nx_wi: 'Read and acknowledge the Work Instruction',
      nx_form_ack: 'Read {d} and confirm you understand it', nx_form_open: 'Open {d}',
      formChip: 'Form', openDoc: 'Open {d}', formAck: 'I have read this form and I understand how to use it.',
      formUnderstood: '{d} understood', formNotAcked: '{d} not acknowledged yet', formOpened: '{d} opened',
      formNotOpened: '{d} not opened yet', openedOn: 'Opened on {d}.',
      formAckedOn: 'You confirmed you understand this form on {d} at {t}.',
      formNotReleasedText: 'This form is not released yet, so there is nothing to open here.',
      about: 'About this course', procedure: 'Procedure',
      wiNotReleased: 'Not released yet.',
      wiNotReleasedText: 'The work instruction for this course is still a draft, so there is nothing to read here yet. Go on to the video.',
      openWI: 'Open the Work Instruction', wiAck: 'I have read this Work Instruction.', confirm: 'Confirm',
      tickConfirm: 'Tick the box to confirm.', openFirst: 'Open the document before you acknowledge it.',
      wiAckedOn: 'You acknowledged this Work Instruction on {d} at {t}.',
      savedWithDoc: 'Your confirmation is saved with the document number, the revision and today’s date.',
      playVideo: 'Play the video', play: 'Play', pause: 'Pause', replay: 'Replay', cont: 'Continue',
      back10: 'Back 10 seconds', captions: 'Captions', fullScreen: 'Full screen', videoControls: 'Video controls',
      videoPos: 'Video position', chaptersLbl: 'Chapters',
      ruleNote: 'You can rewind and replay anything you have finished. You cannot skip ahead.',
      allChapters: 'All chapters complete', checkLeft: 'Check what is left', complete: 'Complete',
      opens: 'Opens after chapter {n}', watched: '{n}% watched', notStarted: 'Not started',
      skip: 'You can rewind, but you cannot skip ahead.',
      past: 'That is past where you have watched. Going back to where you were.',
      chapterDone: 'Chapter {n} complete.',
      videoMissing: 'The video is not available on this page yet. Tell your supervisor.',
      previewMark: 'Mark chapter {n} watched (preview only)',
      watchChapter: 'Watch this chapter',
      everythingDone: 'Everything is done. The test is open.', goTest: 'Go to the test', goVideo: 'Go to the video',
      goWI: 'Go to the Work Instruction', chapterDoneOne: 'Chapter {r} completed', chaptersDoneMany: 'Chapters {r} completed',
      chapterNot: 'Chapter {n}, {t}, not completed', wiAcked: 'Work Instruction acknowledged',
      wiNot: 'Work Instruction not acknowledged yet', doneSr: 'Done: ', notDoneSr: 'Not done: ',
      youPassed: 'You passed. Multiple choice: {c} of {t} correct.', goFinalStep: 'Go to the final step',
      supNeeded: 'Supervisor review needed.',
      supText: 'You have used both attempts. Your supervisor will go over the material with you before you try again.',
      notPassedDot: 'Not passed.', attemptReview: 'Attempt {n} of {t}. Go back over the chapters below before you try again.',
      goneOver: 'I have gone over these', attemptWasNot: 'Attempt {a} was not passed. This is attempt {b} of {t}.',
      attemptOf: 'Attempt {n} of {t}', oneAtTime: 'One question at a time. You can go back and change an answer before you submit.',
      startTest: 'Start the test', testNotOpen: 'The test is not open yet.', opensWhen: 'It opens when everything below is done.',
      backCourse: '‹ Back to the course', knowledgeTest: 'Knowledge test', question: 'Question {n} of {t}',
      prev: '‹ Previous', review: 'Review answers ›', check: 'Check your answers',
      qAnswered: 'Question {n}: answered', qNotAnswered: 'Question {n}: not answered',
      missing: '{n} not answered. An unanswered question counts as wrong.',
      allDone: 'Everything is answered. You cannot change anything after you submit.',
      submit: 'Submit test', passed: 'Passed', notPassed: 'Not passed',
      mcLine: 'Multiple choice: {c} of {t} correct. You needed {n}.', ofCorrect: '{c} of {t} correct',
      mgrLine: 'The one-SA-per-rack question and the blank-tag question both have to be right.',
      goFinalAck: 'Go to the final acknowledgment', oneMore: 'You have one more attempt. Go back over these chapters first.',
      continueBtn: 'Continue', goBackOver: 'Go back over', chapterLink: 'Chapter {n}: {t}', backToCourse: 'Back to the course',
      thatsTrue: 'That is true for me.', yourName: 'Your name', nameHint: 'Your full name, as your supervisor knows it.',
      dateLbl: 'Date', savedNote: 'Saved in this browser with your name and the date. It cannot be changed afterwards.',
      finish: 'Finish the course', tickFinish: 'Tick the box to confirm before you finish.', nameNeeded: 'Type your full name.',
      opensAfterPass: 'This step opens after you pass the test.',
      courseComplete: 'Course complete', recordedAt: 'Recorded {d} at {t}.',
      yourAck: 'Your acknowledgment, exactly as you accepted it:',
      factChapters: 'All {n} video chapters completed', factPassed: 'Test passed at {p}% on multiple choice',
      factWINA: 'No work instruction written only for this course; see Where this is covered',
      section: 'section', gapLead: 'Not yet in a document:',
      codeTitle: 'Your time clock badge number',
      codeIntro: 'Type your time clock badge number, the same number you punch in with. It connects this training to your ICF University record.',
      codeLabel: 'Badge number', codeUse: 'Use this number',
      codeWrong: 'That is not a badge number. It is three or four digits. Check your number and type it again.',
      codeOk: 'Badge number {c} entered.', codeChange: 'Change number', codeNeeded: 'Enter your badge number first.',
      nx_code: 'Enter your badge number', codeDone: 'Badge number entered', codeNotDone: 'Badge number not entered yet',
      goCode: 'Enter the number', f_code: 'Badge number', codeEnding: '{c}',
      completionRecord: 'Completion record', completionCode: 'Completion code',
      f_course: 'Course', f_version: 'Version', f_lang: 'Language', f_name: 'Name', f_date: 'Date',
      f_score: 'Score', f_result: 'Result', f_mgr: 'Must-get-right questions', f_attempts: 'Attempts', f_record: 'Record ID',
      bothRight: 'Both right', langName: 'English',
      emailHow: 'Send your record to ICF. Tap the button. Your email app opens with the message already written. Do not change it. Tap Send.',
      emailBtn: 'Email my record to ICF', emailBackup: 'If your email app did not open, tap Copy record, paste it into a new email and send it to {a}.',
      notSent: 'This record is not sent anywhere. It is kept only in this browser. Give the completion code and the downloaded file to your supervisor, who enters it in ICF University.',
      print: 'Print', download: 'Download record (.json)', copy: 'Copy record', copied: 'Copied.',
      copyFailed: 'Could not copy. Use Download instead.',
      attemptRecord: 'Attempt record', downloadAttempt: 'Download attempt record (.json)',
      attemptRecordNote: 'This is not a completion. Give this file to your supervisor.',
      loadFail: 'The course could not be loaded. Reload the page. If it keeps happening, tell your supervisor.',
      storageOff: 'This browser is not saving progress (private mode or storage blocked). Finish in one sitting, and download your record at the end.'
    },
    es: {
      by: 'de', footer: 'ICF University de ICF Mercantile', home: 'Inicio de ICF University',
      pctComplete: '% completado', next: 'Siguiente:', courseProgress: 'Avance del curso', courseSteps: 'Pasos del curso',
      stepOf: 'Paso {n} de {t}: {s}', locked: 'Bloqueado', back: '‹ Atrás', fwd: 'Siguiente ›',
      version: 'Versión {v}', draftNote: 'Versión de curso en borrador. Todavía no está liberada en ICF University.',
      previewNote: 'Vista previa. Aquí no se registra nada.',
      st_ASSIGNED: 'Asignado', st_IN_PROGRESS: 'En curso', st_AWAITING_ACKNOWLEDGMENT: 'Falta la confirmación final',
      st_SUPERVISOR_REVIEW_REQUIRED: 'Se requiere revisión del supervisor', st_COMPLETED: 'Completado',
      nx_watch: 'Vea el capítulo {n}, {t}', nx_test: 'Examen de conocimientos', nx_review: 'Repáselo antes de su próximo intento',
      nx_ack: 'Confirmación final', nx_done: 'Completo', nx_sup: 'Se requiere revisión del supervisor',
      nx_wi: 'Lea y confirme la instrucción de trabajo',
      nx_form_ack: 'Lea la {d} y confirme que la entiende', nx_form_open: 'Abra la {d}',
      formChip: 'Forma', openDoc: 'Abrir {d}', formAck: 'He leído esta forma y entiendo cómo usarla.',
      formUnderstood: '{d} entendida', formNotAcked: '{d} sin confirmar todavía', formOpened: '{d} abierta',
      formNotOpened: '{d} sin abrir todavía', openedOn: 'Abierta el {d}.',
      formAckedOn: 'Usted confirmó que entiende esta forma el {d} a las {t}.',
      formNotReleasedText: 'Esta forma todavía no está liberada, así que aquí no hay nada que abrir.',
      about: 'Sobre este curso', procedure: 'Procedimiento',
      wiNotReleased: 'Todavía no está liberada.',
      wiNotReleasedText: 'La instrucción de trabajo de este curso todavía es un borrador, así que aquí no hay nada que leer por ahora. Siga con el video.',
      openWI: 'Abrir la instrucción de trabajo', wiAck: 'He leído esta instrucción de trabajo.', confirm: 'Confirmar',
      tickConfirm: 'Marque la casilla para confirmar.', openFirst: 'Abra el documento antes de confirmarlo.',
      wiAckedOn: 'Usted confirmó esta instrucción de trabajo el {d} a las {t}.',
      savedWithDoc: 'Su confirmación se guarda con el número del documento, la revisión y la fecha de hoy.',
      playVideo: 'Reproducir el video', play: 'Ver', pause: 'Pausa', replay: 'Repetir', cont: 'Continuar',
      back10: 'Regresar 10 segundos', captions: 'Subtítulos', fullScreen: 'Pantalla completa', videoControls: 'Controles del video',
      videoPos: 'Posición del video', chaptersLbl: 'Capítulos',
      ruleNote: 'Puede regresar y repetir lo que ya terminó. No puede adelantar.',
      allChapters: 'Todos los capítulos completos', checkLeft: 'Ver lo que falta', complete: 'Completo',
      opens: 'Se abre después del capítulo {n}', watched: '{n}% visto', notStarted: 'Sin empezar',
      skip: 'Puede regresar, pero no puede adelantar.',
      past: 'Eso está más adelante de lo que ha visto. Volvemos a donde estaba.',
      chapterDone: 'Capítulo {n} completo.',
      videoMissing: 'El video todavía no está disponible en esta página. Avise a su supervisor.',
      previewMark: 'Marcar el capítulo {n} como visto (solo vista previa)',
      watchChapter: 'Ver este capítulo',
      everythingDone: 'Todo está hecho. El examen está abierto.', goTest: 'Ir al examen', goVideo: 'Ir al video',
      goWI: 'Ir a la instrucción de trabajo', chapterDoneOne: 'Capítulo {r} completado', chaptersDoneMany: 'Capítulos {r} completados',
      chapterNot: 'Capítulo {n}, {t}, sin completar', wiAcked: 'Instrucción de trabajo confirmada',
      wiNot: 'Instrucción de trabajo sin confirmar todavía', doneSr: 'Listo: ', notDoneSr: 'Falta: ',
      youPassed: 'Aprobó. Opción múltiple: {c} de {t} correctas.', goFinalStep: 'Ir al paso final',
      supNeeded: 'Se necesita la revisión del supervisor.',
      supText: 'Ya usó los dos intentos. Su supervisor repasará el material con usted antes de que lo intente otra vez.',
      notPassedDot: 'No aprobado.', attemptReview: 'Intento {n} de {t}. Repase los capítulos de abajo antes de intentarlo otra vez.',
      goneOver: 'Ya repasé esto', attemptWasNot: 'El intento {a} no se aprobó. Este es el intento {b} de {t}.',
      attemptOf: 'Intento {n} de {t}', oneAtTime: 'Una pregunta a la vez. Puede regresar y cambiar una respuesta antes de enviar.',
      startTest: 'Empezar el examen', testNotOpen: 'El examen todavía no está abierto.', opensWhen: 'Se abre cuando todo lo de abajo esté hecho.',
      backCourse: '‹ Volver al curso', knowledgeTest: 'Examen de conocimientos', question: 'Pregunta {n} de {t}',
      prev: '‹ Anterior', review: 'Revisar respuestas ›', check: 'Revise sus respuestas',
      qAnswered: 'Pregunta {n}: respondida', qNotAnswered: 'Pregunta {n}: sin responder',
      missing: '{n} sin responder. Una pregunta sin responder cuenta como incorrecta.',
      allDone: 'Todo está respondido. No podrá cambiar nada después de enviar.',
      submit: 'Enviar el examen', passed: 'Aprobado', notPassed: 'No aprobado',
      mcLine: 'Opción múltiple: {c} de {t} correctas. Necesitaba {n}.', ofCorrect: '{c} de {t} correctas',
      mgrLine: 'La pregunta de una sola SA por rack y la de la tarjeta en blanco tienen que estar las dos correctas.',
      goFinalAck: 'Ir a la confirmación final', oneMore: 'Le queda un intento más. Primero repase estos capítulos.',
      continueBtn: 'Continuar', goBackOver: 'Repase', chapterLink: 'Capítulo {n}: {t}', backToCourse: 'Volver al curso',
      thatsTrue: 'Eso es cierto en mi caso.', yourName: 'Su nombre', nameHint: 'Su nombre completo, como lo conoce su supervisor.',
      dateLbl: 'Fecha', savedNote: 'Se guarda en este navegador con su nombre y la fecha. Después no se puede cambiar.',
      finish: 'Terminar el curso', tickFinish: 'Marque la casilla para confirmar antes de terminar.', nameNeeded: 'Escriba su nombre completo.',
      opensAfterPass: 'Este paso se abre después de aprobar el examen.',
      courseComplete: 'Curso completo', recordedAt: 'Registrado el {d} a las {t}.',
      yourAck: 'Su confirmación, tal como la aceptó:',
      factChapters: 'Los {n} capítulos del video completados', factPassed: 'Examen aprobado con {p}% en opción múltiple',
      factWINA: 'No hay una instrucción de trabajo escrita solo para este curso; vea Dónde está cubierto',
      section: 'sección', gapLead: 'Todavía no está en un documento:',
      codeTitle: 'Su número de gafete del reloj',
      codeIntro: 'Escriba su número de gafete del reloj, el mismo con el que marca su entrada. Conecta esta capacitación con su registro en ICF University.',
      codeLabel: 'Número de gafete', codeUse: 'Usar este número',
      codeWrong: 'Eso no es un número de gafete. Son tres o cuatro dígitos. Revise su número y escríbalo otra vez.',
      codeOk: 'Número de gafete {c} registrado.', codeChange: 'Cambiar el número', codeNeeded: 'Primero escriba su número de gafete.',
      nx_code: 'Escriba su número de gafete', codeDone: 'Número de gafete registrado', codeNotDone: 'Número de gafete sin escribir todavía',
      goCode: 'Escribir el número', f_code: 'Número de gafete', codeEnding: '{c}',
      completionRecord: 'Registro de finalización', completionCode: 'Código de finalización',
      f_course: 'Curso', f_version: 'Versión', f_lang: 'Idioma', f_name: 'Nombre', f_date: 'Fecha',
      f_score: 'Calificación', f_result: 'Resultado', f_mgr: 'Preguntas que debe acertar', f_attempts: 'Intentos', f_record: 'ID del registro',
      bothRight: 'Las dos correctas', langName: 'Español',
      emailHow: 'Envíe su registro a ICF. Toque el botón. Se abre su aplicación de correo con el mensaje ya escrito. No lo cambie. Toque Enviar.',
      emailBtn: 'Enviar mi registro a ICF por correo', emailBackup: 'Si no se abrió su aplicación de correo, toque Copiar registro, péguelo en un correo nuevo y envíelo a {a}.',
      notSent: 'Este registro no se envía a ninguna parte. Solo se guarda en este navegador. Entregue el código de finalización y el archivo descargado a su supervisor, que lo registra en ICF University.',
      print: 'Imprimir', download: 'Descargar registro (.json)', copy: 'Copiar registro', copied: 'Copiado.',
      copyFailed: 'No se pudo copiar. Use Descargar.',
      attemptRecord: 'Registro de intentos', downloadAttempt: 'Descargar registro de intentos (.json)',
      attemptRecordNote: 'Esto no es una finalización. Entregue este archivo a su supervisor.',
      loadFail: 'No se pudo cargar el curso. Vuelva a cargar la página. Si sigue pasando, avise a su supervisor.',
      storageOff: 'Este navegador no está guardando el avance (modo privado o almacenamiento bloqueado). Termine en una sola sesión y descargue su registro al final.'
    }
  };

  var course = null, state = null, lang = 'en', storageOk = true;

  function t(key, vars) {
    var s = (T[lang] && T[lang][key]) || T.en[key] || key;
    if (vars) { Object.keys(vars).forEach(function (k) { s = s.split('{' + k + '}').join(vars[k]); }); }
    return s;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function L(obj) { return obj ? (obj[lang] || obj.en) : ''; }
  function fmt(sec) {
    sec = Math.max(0, Math.floor(sec || 0));
    var m = Math.floor(sec / 60), s = sec % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }
  function nowIso() { return Core.isoLocal(new Date()); }
  function datePart(iso) { return iso ? iso.slice(0, 10) : ''; }
  function timePart(iso) { return iso ? iso.slice(11, 16) : ''; }

  // ---- storage: a convenience, never trusted for anything but this learner's progress ------------
  function storeKey() { return 'icfu-ext:' + course.course_id + ':' + course.version_label + (PREVIEW ? ':preview' : ''); }
  function load(key, fallback) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch (e) { storageOk = false; return fallback; }
  }
  function save() {
    try { localStorage.setItem(storeKey(), JSON.stringify(state)); }
    catch (e) { storageOk = false; }
  }
  function saveLang() { try { localStorage.setItem('icfu-ext:lang', lang); } catch (e) { /* ignore */ } }

  function freshState() {
    return { v: 1, record_id: Core.randomId(), preview: PREVIEW, started_at: nowIso(), lang: lang,
             frontier: { en: 0, es: 0 }, chapters: [], documents: [], attempts: [],
             draft: null, ack: null, record: null, sent: null };
  }

  // ---- derived course status: same order of rules as ICF University's learning.decorate --------
  // Documents: the Work Instruction and the form used on the floor, as ICF University shows them. A
  // document counts only when course.json marks it RELEASED and gives its file; until then it is
  // shown as not released and does not hold the learner up (ICF University would keep the whole
  // course closed instead; the importer refuses such a record, see README).
  var DOC_ACK = { WORK_INSTRUCTION: { version: 'WI-ACK-1.0', key: 'wiAck' }, FORM: { version: 'FORM-ACK-1.1', key: 'formAck' } };
  function docs() { return course.documents || []; }
  function released(d) { return d.release_state === 'RELEASED' && !!d.file; }
  function releasedDocs() { return docs().filter(released); }
  function needsAck(d) { return d.role === 'WORK_INSTRUCTION' || !!d.requires_ack; }
  function docState(d) {
    return state.documents.filter(function (x) { return x.role === d.role && x.doc_number === d.doc_number && x.revision === d.revision; })[0] || null;
  }
  function docDone(d) { var s = docState(d); return !!(s && s.opened_at && (!needsAck(d) || s.acknowledged_at)); }
  function wiReleased() { return releasedDocs().length > 0; }
  function wiDone() { return releasedDocs().every(docDone); }
  function docLine(d) {
    var name = d.doc_number + ' ' + d.revision, done = docDone(d);
    if (d.role === 'WORK_INSTRUCTION') { return { done: done, text: done ? t('wiAcked') : t('wiNot') }; }
    if (needsAck(d)) { return { done: done, text: t(done ? 'formUnderstood' : 'formNotAcked', { d: name }) }; }
    return { done: done, text: t(done ? 'formOpened' : 'formNotOpened', { d: name }) };
  }
  function chapterDone(n) { return state.chapters.some(function (c) { return c.ordinal === n; }); }
  function allChaptersDone() { return course.chapters.every(function (c) { return chapterDone(c.ordinal); }); }
  function passedAttempt() { return state.attempts.filter(function (a) { return a.passed; })[0] || null; }
  function lastAttempt() { return state.attempts[state.attempts.length - 1] || null; }
  function attemptsLeft() { return Math.max(0, course.max_attempts - state.attempts.length); }
  function postFailReview() {
    var last = lastAttempt();
    return !!(last && !last.passed && !last.review_done_at && attemptsLeft() > 0);
  }
  function hasCode() { return !!(state.badge && Core.normalizeBadge(state.badge)); }
  function prereqsReady() { return hasCode() && wiDone() && allChaptersDone(); }
  function canAttempt() { return !passedAttempt() && attemptsLeft() > 0 && prereqsReady() && !postFailReview(); }
  function status() {
    if (state.ack) { return 'COMPLETED'; }
    if (passedAttempt()) { return 'AWAITING_ACKNOWLEDGMENT'; }
    if (state.attempts.length && !attemptsLeft()) { return 'SUPERVISOR_REVIEW_REQUIRED'; }
    if (state.attempts.length || state.chapters.length || state.documents.length) { return 'IN_PROGRESS'; }
    return 'ASSIGNED';
  }
  function nextStep() {
    var s = status();
    if (s === 'COMPLETED') { return t('nx_done'); }
    if (s === 'SUPERVISOR_REVIEW_REQUIRED') { return t('nx_sup'); }
    if (passedAttempt()) { return t('nx_ack'); }
    if (!hasCode()) { return t('nx_code'); }
    var od = releasedDocs().filter(function (d) { return !docDone(d); })[0];
    if (od) {
      if (od.role === 'WORK_INSTRUCTION') { return t('nx_wi'); }
      return t(needsAck(od) ? 'nx_form_ack' : 'nx_form_open', { d: od.doc_number });
    }
    var nxt = course.chapters.filter(function (c) { return !chapterDone(c.ordinal); })[0];
    if (nxt) { return t('nx_watch', { n: nxt.ordinal, t: L(nxt.title) }); }
    if (postFailReview()) { return t('nx_review'); }
    return t('nx_test');
  }
  function progressPct() {
    if (state.ack) { return 100; }
    var v = videoInfo(), total = v.duration, share = 0;
    course.chapters.forEach(function (c) { if (chapterDone(c.ordinal)) { share += (chEnd(c.ordinal, v) - chStart(c.ordinal, v)) / total; } });
    var parts = [[40, share], [30, passedAttempt() ? 1 : 0], [15, state.ack ? 1 : 0]];
    if (wiReleased()) { parts.push([10, wiDone() ? 1 : 0]); }
    var w = 0, got = 0;
    parts.forEach(function (p) { w += p[0]; got += p[0] * p[1]; });
    return Math.min(99.9, 100 * got / w);
  }

  // ---- video timing (per language; corrected in course.json, never in this file) -----------------
  var realDuration = { en: null, es: null };
  function videoInfo(lg) {
    lg = lg || lang;
    var v = course.video[lg] || course.video.en;
    var d = realDuration[lg] || v.duration_seconds;
    return { file: v.file, captions: v.captions, duration: d, starts: v.chapter_starts };
  }
  function chStart(n, v) { return Math.min(v.starts[n - 1] || 0, v.duration); }
  function chEnd(n, v) { return n < course.chapters.length ? Math.min(v.starts[n], v.duration) : v.duration; }
  function firstOpen() { return course.chapters.filter(function (c) { return !chapterDone(c.ordinal); })[0] || null; }
  // The furthest point the learner may reach in this language's video: what they watched in it, or the
  // start of the first chapter not yet completed (chapters completed in the other language count).
  function frontierOf(lg) {
    var v = videoInfo(lg), f = state.frontier[lg] || 0, open = firstOpen();
    // Nothing completed yet: start from 0, so the opening cards before chapter 1 are seen.
    var openStart = open ? (state.chapters.length ? chStart(open.ordinal, v) : 0) : v.duration;
    return Math.max(f, openStart);
  }
  function completeChaptersUpTo(front, lg, announce) {
    var v = videoInfo(lg), newly = [];
    course.chapters.forEach(function (c) {
      if (chapterDone(c.ordinal)) { return; }
      var prevDone = c.ordinal === 1 || chapterDone(c.ordinal - 1);
      if (prevDone && front >= chEnd(c.ordinal, v) - 1.5) {
        state.chapters.push({ ordinal: c.ordinal, completed_at: nowIso(), lang: lg, frontier_ms: Math.round(front * 1000) });
        newly.push(c.ordinal);
      }
    });
    if (newly.length) { save(); if (announce) { announce(newly); } }
    return newly;
  }

  // ---------------------------------------------------------------------------------------------
  // rendering
  // ---------------------------------------------------------------------------------------------
  var STEP_KIND = { 1: 'wi', 2: 'video', 3: 'keys', 4: 'ready', 5: 'test', 6: 'final' };
  var stopPlayer = null;

  function route() {
    var h = location.hash.replace(/^#\/?/, '');
    var m = /^step\/(\d)$/.exec(h);
    if (m) { return { view: 'step', step: Math.min(6, Math.max(1, parseInt(m[1], 10))) }; }
    if (h === 'test') { return { view: 'test' }; }
    if (h === 'result') { return { view: 'result' }; }
    return { view: 'step', step: defaultStep() };
  }
  function defaultStep() {
    if (state.ack || passedAttempt()) { return 6; }
    if (state.attempts.length) { return 5; }
    if (!hasCode() || !wiDone()) { return 1; }
    if (allChaptersDone()) { return 4; }
    return state.chapters.length || state.started_seen ? 2 : 1;
  }
  function go(hash) { if (location.hash === hash) { render(); } else { location.hash = hash; } }

  function stepDone(n) {
    switch (n) {
      case 1: return hasCode() && wiDone();
      case 2: return allChaptersDone();
      case 3: return allChaptersDone();
      case 4: return prereqsReady();
      case 5: return !!passedAttempt();
      case 6: return !!state.ack;
    }
    return false;
  }

  function header(stepN) {
    var st = status(), pct = progressPct();
    var pill = st === 'COMPLETED' ? 'ok' : (st === 'AWAITING_ACKNOWLEDGMENT' ? 'watch' : (st === 'SUPERVISOR_REVIEW_REQUIRED' ? 'act' : 'info'));
    var html = '';
    if (PREVIEW) { html += '<div class="notice info no-print" role="note"><b>' + esc(t('previewNote')) + '</b></div>'; }
    if (!storageOk) { html += '<div class="notice warn no-print" role="note">' + esc(t('storageOff')) + '</div>'; }
    html += '<section class="course-head" aria-label="' + esc(t('courseProgress')) + '">' +
      '<p class="course-meta">' + esc(course.course_id) + ' &middot; ' + esc(t('version', { v: course.version_label })) +
      (course.release_state === 'DRAFT' ? ' &middot; ' + esc(t('draftNote')) : '') + '</p>' +
      '<h1>' + esc(L(course.title)) + '</h1>' +
      '<div class="meter-wrap"><div class="meter-top"><span class="pct"><b>' + Math.round(pct) + '</b>' + esc(t('pctComplete')) + '</span>' +
      '<span class="pill ' + pill + '">' + esc(t('st_' + st)) + '</span></div>' +
      '<div class="meter" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(pct) + '" aria-label="' + esc(t('courseProgress')) + '">' +
      '<i style="width:' + pct.toFixed(1) + '%"></i></div>' +
      '<p class="next-line"><span class="muted">' + esc(t('next')) + '</span> ' + esc(nextStep()) + '</p></div></section>';
    var items = course.steps.map(function (s) {
      var done = stepDone(s.ordinal), cur = s.ordinal === stepN;
      var locked = (s.ordinal === 5 && !prereqsReady() && !state.attempts.length) || (s.ordinal === 6 && !passedAttempt());
      return '<li class="' + (cur ? 'current ' : '') + (done ? 'done ' : '') + (locked ? 'locked' : '') + '">' +
        '<a href="#/step/' + s.ordinal + '"' + (cur ? ' aria-current="step"' : '') + '>' +
        '<span class="num">' + (done ? '&#10003;' : s.ordinal) + '</span><span class="lbl">' + esc(L(s.title)) + '</span>' +
        (locked ? '<span class="lk">' + esc(t('locked')) + '</span>' : '') + '</a></li>';
    }).join('');
    var curStep = course.steps[stepN - 1];
    html += '<div class="learn"><nav class="steps" aria-label="' + esc(t('courseSteps')) + '"><details class="steps-wrap" data-steps>' +
      '<summary>' + esc(t('stepOf', { n: stepN, t: course.steps.length, s: L(curStep.title) })) + '</summary><ol>' + items + '</ol></details></nav>' +
      '<section class="step-body" aria-label="' + esc(L(curStep.title)) + '">';
    return html;
  }
  function footerNav(stepN) {
    var kind = STEP_KIND[stepN];
    return '<div class="step-nav no-print">' +
      (stepN > 1 ? '<a class="btn" href="#/step/' + (stepN - 1) + '">' + esc(t('back')) + '</a>' : '<span></span>') +
      (stepN < course.steps.length ? '<a class="btn' + (stepDone(stepN) || kind === 'keys' || kind === 'ready' ? ' primary' : '') +
        '" href="#/step/' + (stepN + 1) + '">' + esc(t('fwd')) + '</a>' : '') + '</div></section></div>';
  }

  function checklist() {
    var items = [{ done: hasCode(), text: hasCode() ? t('codeDone') : t('codeNotDone') }].concat(releasedDocs().map(docLine));
    var done = course.chapters.filter(function (c) { return chapterDone(c.ordinal); }).map(function (c) { return c.ordinal; });
    if (done.length) {
      var r = done.length === 1 ? String(done[0]) : (done[done.length - 1] - done[0] === done.length - 1 ? done[0] + '–' + done[done.length - 1] : done.join(', '));
      items.push({ done: true, text: t(done.length === 1 ? 'chapterDoneOne' : 'chaptersDoneMany', { r: r }) });
    }
    course.chapters.forEach(function (c) {
      if (!chapterDone(c.ordinal)) { items.push({ done: false, text: t('chapterNot', { n: c.ordinal, t: L(c.title) }) }); }
    });
    return '<ul class="checklist">' + items.map(function (i) {
      return '<li class="' + (i.done ? 'done' : 'todo') + '"><span class="mark" aria-hidden="true">' + (i.done ? '&#10003;' : '&#9675;') + '</span>' +
        '<span class="txt"><span class="sr">' + esc(i.done ? t('doneSr') : t('notDoneSr')) + '</span>' + esc(i.text) + '</span></li>';
    }).join('') + '</ul>';
  }

  // "Where this is covered": verbatim quotes from the controlled documents (English, as written),
  // the BH-practice note and the line saying what no document says yet. All of it from course.json.
  function coverageHtml() {
    var cov = course.coverage;
    if (!cov || !cov.items || !cov.items.length) { return ''; }
    return '<p class="muted">' + esc(L(cov.lead)) + '</p><ul class="coverage">' + cov.items.map(function (it) {
      return '<li><p class="cov-src"><b>' + esc(it.doc) + '</b>, ' + esc(it.revision) + ', ' + esc(t('section')) + ' ' + esc(it.section) + '</p>' +
        (it.context ? '<p class="cov-ctx">' + esc(L(it.context)) + '</p>' : '') +
        it.quotes.map(function (q) { return '<blockquote class="cov-quote" lang="en">“' + esc(q) + '”</blockquote>'; }).join('') +
        (it.note ? '<div class="notice warn cov-note">' + esc(L(it.note)) + '</div>' : '') + '</li>';
    }).join('') + '</ul>' + (cov.gap ? '<div class="notice info"><b>' + esc(t('gapLead')) + '</b> ' + esc(L(cov.gap)) + '</div>' : '');
  }

  // ---- step 1: the course card, the Work Instruction and the form -------------------------------
  function codeCard() {
    var html = '<div class="card" id="access-code"><h2>' + esc(t('codeTitle')) + '</h2>';
    if (hasCode()) {
      html += '<p class="ok-line"><span class="mark" aria-hidden="true">&#10003;</span>' + esc(t('codeOk', { c: state.badge })) + '</p>' +
        (state.attempts.length ? '' : '<div class="actions"><button type="button" class="btn small" data-codechange>' + esc(t('codeChange')) + '</button></div>');
      return html + '</div>';
    }
    return html + '<p>' + esc(t('codeIntro')) + '</p><form data-codeform novalidate><div class="field">' +
      '<label for="acccode">' + esc(t('codeLabel')) + '</label>' +
      '<input type="text" id="acccode" name="code" class="code-input" inputmode="numeric" pattern="[0-9]*" autocomplete="off" autocorrect="off" spellcheck="false" maxlength="6" placeholder="0000" aria-describedby="codemsg"></div>' +
      '<p class="notice err" id="codemsg" data-codemsg role="alert" hidden></p>' +
      '<div class="actions"><button type="submit" class="btn primary">' + esc(t('codeUse')) + '</button></div></form></div>';
  }
  function wireCode() {
    var f = app.querySelector('[data-codeform]');
    if (f) {
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var code = Core.normalizeBadge(f.elements.code.value), msg = f.querySelector('[data-codemsg]');
        if (!code) { msg.textContent = t('codeWrong'); msg.hidden = false; f.elements.code.focus(); return; }
        state.badge = code; save(); render();
      });
    }
    var ch = app.querySelector('[data-codechange]');
    if (ch) { ch.addEventListener('click', function () { if (!state.attempts.length) { state.badge = null; save(); render(); } }); }
  }

  function stepWI(s) {
    var html = codeCard() + '<div class="card"><h2>' + esc(t('about')) + '</h2><p>' + esc(L(course.summary)) + '</p>' +
      '<ul class="facts"><li><b>' + esc(t('procedure')) + ':</b> ' + esc(L(course.procedure)) + '</li><li>' + esc(L(course.reference_note)) + '</li></ul></div>';
    html += '<div class="card"><h2>' + esc(L(s.title)) + '</h2>';
    var rel = releasedDocs();
    html += '<p>' + esc(L(s.body)) + '</p>' + coverageHtml();
    docs().forEach(function (d, i) {
      var chip = d.role === 'WORK_INSTRUCTION' ? '<span class="chip wi">WI</span>' : '<span class="chip wi">' + esc(t('formChip')) + '</span>';
      if (!released(d)) {
        html += '<div class="notice info"><b>' + esc(t('wiNotReleased')) + '</b> ' +
          esc(d.role === 'WORK_INSTRUCTION' ? t('wiNotReleasedText') : t('formNotReleasedText')) + '</div>' +
          '<p class="muted">' + chip + ' ' + esc(d.doc_number) + ' ' + esc(d.revision) + '</p>';
        return;
      }
      var ds = docState(d) || {}, ackKey = DOC_ACK[d.role] ? DOC_ACK[d.role].key : 'formAck';
      html += '<div class="ack-panel' + (docDone(d) ? ' is-done' : '') + '"><p>' + chip + ' <b>' + esc(d.doc_number) + ' ' + esc(d.revision) + '</b></p>' +
        '<div class="actions"><a class="btn" href="' + esc(d.file) + '" target="_blank" rel="noopener" data-docopen="' + i + '">' +
        esc(d.role === 'WORK_INSTRUCTION' ? t('openWI') : t('openDoc', { d: d.doc_number })) + '</a></div>';
      if (!needsAck(d)) {
        html += ds.opened_at ? '<p class="ok-line small-note"><span class="mark" aria-hidden="true">&#10003;</span>' + esc(t('openedOn', { d: datePart(ds.opened_at) })) + '</p>' : '';
      } else if (ds.acknowledged_at) {
        html += '<p class="ok-line small-note"><span class="mark" aria-hidden="true">&#10003;</span>' +
          esc(t(d.role === 'WORK_INSTRUCTION' ? 'wiAckedOn' : 'formAckedOn', { d: datePart(ds.acknowledged_at), t: timePart(ds.acknowledged_at) })) + '</p>';
      } else {
        html += '<label class="check"><input type="checkbox" data-docack="' + i + '"><span>' + esc(t(ackKey)) + '</span></label>' +
          '<p class="muted small-note" data-docmsg="' + i + '">' + esc(ds.opened_at ? t('savedWithDoc') : t('openFirst')) + '</p>' +
          '<div class="actions"><button type="button" class="btn primary" data-docconfirm="' + i + '">' + esc(t('confirm')) + '</button></div>';
      }
      html += '</div>';
    });
    if (!rel.length || wiDone()) {
      html += '<div class="actions"><a class="btn primary" href="#/step/2" data-seen>' + esc(t('goVideo')) + '</a></div>';
    }
    return html + '</div>';
  }
  function wireWI() {
    var seen = app.querySelector('[data-seen]');
    if (seen) { seen.addEventListener('click', function () { state.started_seen = true; save(); }); }
    function stateFor(d) {
      var ds = docState(d);
      if (!ds) { ds = { role: d.role, doc_number: d.doc_number, revision: d.revision, release_state: d.release_state }; state.documents.push(ds); }
      return ds;
    }
    app.querySelectorAll('[data-docopen]').forEach(function (a) {
      a.addEventListener('click', function () {
        var i = a.getAttribute('data-docopen'), d = docs()[i], ds = stateFor(d);
        if (!ds.opened_at) { ds.opened_at = nowIso(); ds.lang = lang; save(); }
        var msg = app.querySelector('[data-docmsg="' + i + '"]'); if (msg) { msg.textContent = t('savedWithDoc'); }
        if (!needsAck(d)) { setTimeout(render, 300); }
      });
    });
    app.querySelectorAll('[data-docconfirm]').forEach(function (b) {
      b.addEventListener('click', function () {
        var i = b.getAttribute('data-docconfirm'), d = docs()[i], ds = docState(d);
        var box = app.querySelector('[data-docack="' + i + '"]'), msg = app.querySelector('[data-docmsg="' + i + '"]');
        if (!ds || !ds.opened_at) { msg.textContent = t('openFirst'); return; }
        if (!box.checked) { msg.textContent = t('tickConfirm'); return; }
        var a = DOC_ACK[d.role] || DOC_ACK.FORM;
        ds.acknowledged_at = nowIso(); ds.ack_text_version = a.version; ds.ack_text_shown = t(a.key); ds.lang = lang;
        save(); render();
      });
    });
  }

  // ---- step 2: the video -----------------------------------------------------------------------
  function stepVideo(s) {
    if (!hasCode()) {
      return '<div class="card"><h2>' + esc(L(s.title)) + '</h2><div class="notice info">' + esc(t('codeNeeded')) + '</div>' +
        '<div class="actions"><a class="btn primary" href="#/step/1">' + esc(t('goCode')) + '</a></div></div>';
    }
    var v = videoInfo(), front = frontierOf(lang);
    var ticks = course.chapters.filter(function (c) { return c.ordinal > 1; }).map(function (c) {
      return '<span class="seek-tick" style="left:' + (100 * chStart(c.ordinal, v) / v.duration).toFixed(2) + '%"></span>';
    }).join('');
    var chs = course.chapters.map(function (c) {
      return '<li id="ch' + c.ordinal + '" data-chapter="' + c.ordinal + '"><span class="ch-mark" aria-hidden="true"></span>' +
        '<span class="ch-body"><span class="ch-title">' + c.ordinal + '. ' + esc(L(c.title)) + '</span><span class="ch-meta" data-chmeta></span></span>' +
        '<button type="button" class="btn small" data-chplay="' + c.ordinal + '"></button>' +
        (PREVIEW ? '<button type="button" class="btn small" data-chmark="' + c.ordinal + '" style="grid-column:2/4">' + esc(t('previewMark', { n: c.ordinal })) + '</button>' : '') +
        '</li>';
    }).join('');
    return '<div class="card video-card"><h2>' + esc(L(s.title)) + '</h2><p>' + esc(L(s.body)) + '</p>' +
      '<div class="notice err" data-vmissing hidden>' + esc(t('videoMissing')) + '</div>' +
      '<div class="player" data-player><div class="stage">' +
      '<video data-video playsinline preload="metadata" disablepictureinpicture controlslist="nodownload noremoteplayback" aria-label="' + esc(L(course.title)) + '">' +
      '<source src="' + esc(v.file) + '" type="video/mp4">' +
      '<track kind="captions" srclang="' + lang + '" label="' + esc(t('langName')) + '" src="' + esc(v.captions) + '" default>' +
      '</video>' +
      '<button type="button" class="bigplay" data-act="bigplay" aria-label="' + esc(t('playVideo')) + '"><svg viewBox="0 0 24 24" width="38" height="38" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></button>' +
      '<div class="stage-msg" data-msg role="status" aria-live="polite" hidden></div></div>' +
      '<div class="pcontrols" role="group" aria-label="' + esc(t('videoControls')) + '">' +
      '<button type="button" class="btn icon" data-act="play" aria-label="' + esc(t('play')) + '"><svg class="i-play" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg><svg class="i-pause" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" hidden><path d="M6 5h4v14H6zM14 5h4v14h-4z" fill="currentColor"/></svg></button>' +
      '<button type="button" class="btn icon" data-act="back10" aria-label="' + esc(t('back10')) + '"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 5V2L7 6.5 12 11V8a5 5 0 1 1-5 5H5a7 7 0 1 0 7-8z" fill="currentColor"/></svg></button>' +
      '<div class="seek" data-seek role="slider" tabindex="0" aria-label="' + esc(t('videoPos')) + '" aria-valuemin="0" aria-valuemax="' + Math.floor(v.duration) + '" aria-valuenow="0">' +
      '<div class="seek-track"><i class="seek-watched" data-watched style="width:' + (100 * front / v.duration).toFixed(2) + '%"></i><i class="seek-played" data-played></i></div>' + ticks + '</div>' +
      '<span class="time" data-time>0:00 / ' + fmt(v.duration) + '</span>' +
      '<button type="button" class="btn icon text" data-act="cc" aria-label="' + esc(t('captions')) + '">CC</button>' +
      '<button type="button" class="btn icon" data-act="full" aria-label="' + esc(t('fullScreen')) + '"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M5 5h5v2H7v3H5zM14 5h5v5h-2V7h-3zM5 14h2v3h3v2H5zM17 14h2v5h-5v-2h3z" fill="currentColor"/></svg></button>' +
      '</div><p class="rule-note">' + esc(t('ruleNote')) + '</p>' +
      '<ol class="chapters" aria-label="' + esc(t('chaptersLbl')) + '">' + chs +
      '<li class="done-line" data-alldone hidden><span class="ch-mark" aria-hidden="true">&#10003;</span><span class="ch-body"><span class="ch-title">' + esc(t('allChapters')) + '</span></span>' +
      '<a class="btn small primary" href="#/step/4">' + esc(t('checkLeft')) + '</a></li></ol></div></div>';
  }

  function wireVideo() {
    var root = app.querySelector('[data-player]');
    var v = root.querySelector('[data-video]');
    var q = function (sel) { return root.querySelector(sel); };
    var seek = q('[data-seek]'), watchedEl = q('[data-watched]'), playedEl = q('[data-played]');
    var timeEl = q('[data-time]'), msgEl = q('[data-msg]'), stage = q('.stage');
    var playBtn = q('[data-act="play"]'), bigBtn = q('[data-act="bigplay"]');
    var iPlay = playBtn.querySelector('.i-play'), iPause = playBtn.querySelector('.i-pause');
    var lg = lang, lastTime = 0, msgTimer = null, saveTimer = null, failed = false;
    var SLACK = 0.75, LEAD = 10;

    function info() { return videoInfo(lg); }
    function say(text, ms) {
      msgEl.textContent = text; msgEl.hidden = false; clearTimeout(msgTimer);
      if (ms) { msgTimer = setTimeout(function () { msgEl.hidden = true; }, ms); }
    }
    function limit() { return Math.min(info().duration, frontierOf(lg) + SLACK); }
    function setPos(x) { if (failed) { return; } v.currentTime = Math.max(0, Math.min(x, limit())); paint(); }
    function paint() {
      var d = info().duration, x = v.currentTime || 0, f = Math.min(frontierOf(lg), d);
      playedEl.style.width = (100 * x / d) + '%';
      watchedEl.style.width = (100 * f / d) + '%';
      timeEl.textContent = fmt(x) + ' / ' + fmt(d);
      seek.setAttribute('aria-valuenow', Math.floor(x));
      seek.setAttribute('aria-valuetext', fmt(x) + ' / ' + fmt(d));
      var playing = !v.paused && !v.ended;
      iPlay.hidden = playing; iPause.hidden = !playing;
      playBtn.setAttribute('aria-label', playing ? t('pause') : t('play'));
      bigBtn.hidden = playing || failed;
    }
    function paintChapters() {
      var vi = info(), front = frontierOf(lg), current = firstOpen();
      course.chapters.forEach(function (c) {
        var li = root.querySelector('[data-chapter="' + c.ordinal + '"]');
        var done = chapterDone(c.ordinal), s0 = chStart(c.ordinal, vi), e0 = chEnd(c.ordinal, vi);
        var locked = !done && s0 > front + 2;
        var pct = done ? 100 : Math.max(0, Math.min(100, 100 * (front - s0) / Math.max(0.001, e0 - s0)));
        var isCur = current && current.ordinal === c.ordinal;
        li.classList.toggle('done', done); li.classList.toggle('locked', locked); li.classList.toggle('now', !!isCur);
        li.querySelector('.ch-mark').textContent = done ? '✓' : (isCur ? '●' : '○');
        li.querySelector('[data-chmeta]').textContent = fmt(e0 - s0) + ' · ' + (done ? t('complete') :
          (locked ? t('opens', { n: c.ordinal - 1 }) : (pct > 0 ? t('watched', { n: Math.floor(pct) }) : t('notStarted'))));
        var b = li.querySelector('[data-chplay]');
        b.disabled = locked || failed;
        b.textContent = done ? t('replay') : (isCur && pct > 0 ? t('cont') : t('play'));
      });
      q('[data-alldone]').hidden = !allChaptersDone();
    }
    function refreshHead() {
      // keep the progress meter and the step list honest without re-rendering the player
      var pct = progressPct();
      var b = app.querySelector('.pct b'); if (b) { b.textContent = Math.round(pct); }
      var bar = app.querySelector('.meter > i'); if (bar) { bar.style.width = pct.toFixed(1) + '%'; }
      var nl = app.querySelector('.next-line'); if (nl) { nl.innerHTML = '<span class="muted">' + esc(t('next')) + '</span> ' + esc(nextStep()); }
      var pill = app.querySelector('.meter-top .pill'); if (pill) { pill.textContent = t('st_' + status()); }
    }
    function announce(list) { list.forEach(function (n) { say(t('chapterDone', { n: n }), 4000); }); paintChapters(); refreshHead(); }
    function advance() {
      var x = v.currentTime, f = frontierOf(lg);
      if (!v.paused && !v.seeking && x > f && x - lastTime < 1.5 && x <= f + LEAD) {
        state.frontier[lg] = x;
        if (!saveTimer) { saveTimer = setTimeout(function () { saveTimer = null; save(); }, 4000); }
      }
      lastTime = x;
      completeChaptersUpTo(frontierOf(lg), lg, announce);
    }
    function fail() {
      failed = true;
      app.querySelector('[data-vmissing]').hidden = false;
      say(t('videoMissing'));
      paint(); paintChapters();
    }

    v.addEventListener('loadedmetadata', function () {
      if (isFinite(v.duration) && v.duration > 0) { realDuration[lg] = v.duration; }
      // resume where the learner stopped, as ICF University does; start over once everything is done
      v.currentTime = firstOpen() ? Math.min(frontierOf(lg), info().duration) : 0;
      lastTime = v.currentTime;
      paint(); paintChapters();
    });
    v.addEventListener('error', fail, true);
    var src = v.querySelector('source'); if (src) { src.addEventListener('error', fail); }
    v.addEventListener('play', paint);
    v.addEventListener('pause', function () { paint(); save(); });
    v.addEventListener('ended', function () {
      if (lastTime >= frontierOf(lg) - 2) { state.frontier[lg] = info().duration; }
      completeChaptersUpTo(frontierOf(lg), lg, announce); save(); paint();
    });
    v.addEventListener('seeking', function () {
      if (v.currentTime > limit() + 0.25) { v.currentTime = Math.min(frontierOf(lg), info().duration); say(t('skip'), 3500); }
    });
    v.addEventListener('seeked', function () { lastTime = v.currentTime; paint(); });
    v.addEventListener('timeupdate', function () {
      if (v.currentTime > frontierOf(lg) + LEAD) { v.pause(); v.currentTime = frontierOf(lg); say(t('past'), 4500); }
      advance(); paint();
    });
    v.addEventListener('ratechange', function () { if (v.playbackRate !== 1) { v.playbackRate = 1; } });
    function onVis() { if (document.hidden && !v.paused) { v.pause(); } }
    document.addEventListener('visibilitychange', onVis);

    function toggle() {
      if (failed) { return; }
      if (v.paused || v.ended) {
        if (v.ended) { v.currentTime = 0; }
        var p = v.play(); if (p && p.catch) { p.catch(function () {}); }
      } else { v.pause(); }
    }
    playBtn.addEventListener('click', toggle); bigBtn.addEventListener('click', toggle); v.addEventListener('click', toggle);
    q('[data-act="back10"]').addEventListener('click', function () { setPos((v.currentTime || 0) - 10); });
    function fromPointer(e) {
      var r = seek.getBoundingClientRect(), want = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * info().duration;
      if (want > limit()) { say(t('skip'), 2500); }
      setPos(want);
    }
    var dragging = false;
    seek.addEventListener('pointerdown', function (e) { dragging = true; try { seek.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ } fromPointer(e); });
    seek.addEventListener('pointermove', function (e) { if (dragging) { fromPointer(e); } });
    seek.addEventListener('pointerup', function () { dragging = false; });
    seek.addEventListener('pointercancel', function () { dragging = false; });
    seek.addEventListener('keydown', function (e) {
      var x = v.currentTime || 0;
      if (e.key === 'ArrowLeft') { setPos(x - 5); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { setPos(x + 5); e.preventDefault(); }
      else if (e.key === 'Home') { setPos(0); e.preventDefault(); }
      else if (e.key === 'End') { setPos(frontierOf(lg)); e.preventDefault(); }
      else if (e.key === ' ' || e.key === 'k') { toggle(); e.preventDefault(); }
    });
    root.querySelectorAll('[data-chplay]').forEach(function (b) {
      b.addEventListener('click', function () {
        var n = parseInt(b.getAttribute('data-chplay'), 10), vi = info();
        var target = chapterDone(n) ? chStart(n, vi) : Math.max(chStart(n, vi), Math.min(frontierOf(lg), chEnd(n, vi) - 0.5));
        setPos(target); lastTime = v.currentTime;
        var p = v.play(); if (p && p.catch) { p.catch(function () {}); }
        stage.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      });
    });
    root.querySelectorAll('[data-chmark]').forEach(function (b) {
      b.addEventListener('click', function () {
        var n = parseInt(b.getAttribute('data-chmark'), 10);
        if (n === 1 || chapterDone(n - 1)) {
          state.frontier[lg] = Math.max(state.frontier[lg] || 0, chEnd(n, info()));
          completeChaptersUpTo(frontierOf(lg), lg, announce); save();
        }
      });
    });
    var ccBtn = q('[data-act="cc"]');
    function track() { return v.textTracks && v.textTracks[0]; }
    function ccPaint() {
      var tr = track(), on = !!(tr && tr.mode === 'showing');
      ccBtn.textContent = on ? lg.toUpperCase() : 'CC';
      ccBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    ccBtn.addEventListener('click', function () { var tr = track(); if (tr) { tr.mode = tr.mode === 'showing' ? 'disabled' : 'showing'; } ccPaint(); });
    setTimeout(function () { var tr = track(); if (tr && tr.mode !== 'showing') { tr.mode = 'showing'; } ccPaint(); }, 300);
    q('[data-act="full"]').addEventListener('click', function () {
      if (document.fullscreenElement) { document.exitFullscreen(); return; }
      if (root.requestFullscreen) { root.requestFullscreen().catch(function () {}); }
      else if (v.webkitEnterFullscreen) { v.webkitEnterFullscreen(); }
    });

    paint(); paintChapters();
    if (location.hash.indexOf('#ch') === -1 && /#\/step\/2/.test(location.hash) && sessionStorageJump) {
      var el = document.getElementById('ch' + sessionStorageJump); sessionStorageJump = null;
      if (el) { setTimeout(function () { el.scrollIntoView({ block: 'center' }); }, 150); }
    }
    stopPlayer = function () { try { v.pause(); } catch (e) { /* ignore */ } save(); document.removeEventListener('visibilitychange', onVis); };
  }
  var sessionStorageJump = null;

  // ---- step 3 and 4 --------------------------------------------------------------------------
  function stepKeys(s) {
    return '<div class="card"><h2>' + esc(L(s.title)) + '</h2><p>' + esc(L(s.body)) + '</p><ol class="keypoints">' +
      course.chapters.map(function (c) {
        return '<li><h3>' + c.ordinal + '. ' + esc(L(c.title)) + '</h3><p>' + esc(L(c.points)) + '</p>' +
          '<a class="small-link" href="#/step/2" data-jump="' + c.ordinal + '">' + esc(t('watchChapter')) + '</a></li>';
      }).join('') + '</ol></div>';
  }
  function stepReady(s) {
    var ready = prereqsReady();
    return '<div class="card"><h2>' + esc(L(s.title)) + '</h2>' +
      (ready ? '<p class="ok-line"><span class="mark" aria-hidden="true">&#10003;</span> ' + esc(t('everythingDone')) + '</p>' : '<p>' + esc(L(s.body)) + '</p>') +
      checklist() + '<div class="actions">' +
      (ready ? '<a class="btn primary" href="#/step/5">' + esc(t('goTest')) + '</a>'
        : !hasCode() ? '<a class="btn primary" href="#/step/1">' + esc(t('goCode')) + '</a>'
        : (!wiDone() ? '<a class="btn primary" href="#/step/1">' + esc(t('goWI')) + '</a>' : '<a class="btn primary" href="#/step/2">' + esc(t('goVideo')) + '</a>')) +
      '</div></div>';
  }

  // ---- step 5: the test card ----------------------------------------------------------------------
  function feedbackHtml(att) {
    var g = { items: att.items };
    var ps = Core.pointers(course, g, lang);
    var out = '';
    if (ps.length) {
      out += '<h3>' + esc(t('goBackOver')) + '</h3><ul class="pointers">' + ps.map(function (p) {
        return '<li><a href="#/step/2" data-jump="' + p.chapter + '"><b>' + esc(t('chapterLink', { n: p.chapter, t: p.title })) + '</b></a>' +
          (p.concepts.length ? '<span class="muted"> &middot; ' + esc(p.concepts.join(', ')) + '</span>' : '') + '</li>';
      }).join('') + '</ul>';
    }
    if (!att.must_get_right_ok) { out += '<p class="muted">' + esc(t('mgrLine')) + '</p>'; }
    return out;
  }
  function stepTest(s) {
    var html = '<div class="card"><h2>' + esc(L(s.title)) + '</h2>', last = lastAttempt(), pa = passedAttempt();
    if (pa) {
      html += '<p class="ok-line"><span class="mark" aria-hidden="true">&#10003;</span> ' + esc(t('youPassed', { c: pa.earned, t: pa.possible })) + '</p>' +
        '<div class="actions"><a class="btn primary" href="#/step/6">' + esc(t('goFinalStep')) + '</a></div>';
    } else if (status() === 'SUPERVISOR_REVIEW_REQUIRED') {
      html += '<div class="notice warn"><b>' + esc(t('supNeeded')) + '</b> ' + esc(t('supText')) + '</div>' + feedbackHtml(last) + attemptRecordBlock();
    } else if (postFailReview()) {
      html += '<div class="notice warn"><b>' + esc(t('notPassedDot')) + '</b> ' + esc(t('attemptReview', { n: last.attempt_no, t: course.max_attempts })) + '</div>' +
        feedbackHtml(last) + '<div class="actions"><button type="button" class="btn primary" data-reviewed>' + esc(t('goneOver')) + '</button></div>';
    } else if (canAttempt()) {
      html += '<p>' + esc(L(s.body)) + '</p>' +
        (last ? '<div class="notice info">' + esc(t('attemptWasNot', { a: last.attempt_no, b: state.attempts.length + 1, t: course.max_attempts })) + '</div>' : '') +
        '<ul class="facts"><li>' + esc(t('attemptOf', { n: state.attempts.length + 1, t: course.max_attempts })) + '</li><li>' + esc(t('oneAtTime')) + '</li></ul>' +
        '<div class="actions"><a class="btn primary" href="#/test">' + esc(t('startTest')) + '</a></div>';
    } else {
      html += '<div class="notice info"><b>' + esc(t('testNotOpen')) + '</b> ' + esc(t('opensWhen')) + '</div>' + checklist() +
        '<button class="btn" type="button" disabled>' + esc(t('startTest')) + '</button>';
    }
    return html + '</div>';
  }

  // ---- the test page: one question at a time, as quiz.js does it --------------------------------
  function viewTest() {
    if (!canAttempt()) { go('#/step/5'); return; }
    var n = state.attempts.length + 1;
    if (!state.draft || state.draft.attempt_no !== n) { state.draft = { attempt_no: n, started_at: nowIso(), answers: {}, lang: lang, shuffle_seed: Core.newSeed() }; save(); }
    if (typeof state.draft.shuffle_seed !== 'number') { state.draft.shuffle_seed = Core.newSeed(); save(); }
    var total = course.questions.length;
    var cards = course.questions.map(function (q, i) {
      return '<fieldset class="qcard" data-q="' + i + '"><legend><span class="qnum">' + q.ordinal + '</span><span class="qtext">' + esc(L(q.prompt)) + '</span></legend>' +
        Core.optionOrder(state.draft.shuffle_seed, q.ordinal, q.options.length).map(function (k) {
          var o = q.options[k - 1];
          return '<label class="opt"><input type="radio" name="q' + q.ordinal + '" value="' + o.ordinal + '"><span>' + esc(L(o)) + '</span></label>';
        }).join('') + '</fieldset>';
    }).join('');
    app.innerHTML = (PREVIEW ? '<div class="notice info" role="note"><b>' + esc(t('previewNote')) + '</b></div>' : '') +
      '<div class="quiz-wrap"><p class="crumb"><a href="#/step/5">' + esc(t('backCourse')) + '</a></p>' +
      '<h1>' + esc(t('knowledgeTest')) + '</h1><p class="lede">' + esc(t('attemptOf', { n: n, t: course.max_attempts })) + '</p>' +
      '<form data-quiz novalidate><div class="quiz-top"><span class="qcount" data-qcount></span>' +
      '<div class="meter small" role="progressbar" aria-valuemin="0" aria-valuemax="' + total + '" aria-valuenow="0" data-qmeter><i style="width:0"></i></div></div>' +
      cards + '<section class="qcard" data-review hidden><h2>' + esc(t('check')) + '</h2><ul class="review-list" data-reviewlist></ul><p class="muted" data-reviewnote></p></section>' +
      '<div class="quiz-nav"><button type="button" class="btn" data-prev hidden>' + esc(t('prev')) + '</button>' +
      '<button type="button" class="btn primary" data-next>' + esc(t('fwd')) + '</button>' +
      '<button type="submit" class="btn primary" data-submit hidden>' + esc(t('submit')) + '</button></div></form></div>';

    var form = app.querySelector('[data-quiz]');
    var qcards = Array.prototype.slice.call(form.querySelectorAll('.qcard[data-q]'));
    var reviewEl = form.querySelector('[data-review]'), list = form.querySelector('[data-reviewlist]'), note = form.querySelector('[data-reviewnote]');
    var qcount = form.querySelector('[data-qcount]'), qmeter = form.querySelector('[data-qmeter]');
    var prev = form.querySelector('[data-prev]'), next = form.querySelector('[data-next]'), submit = form.querySelector('[data-submit]');
    var index = 0, onReview = false;

    Object.keys(state.draft.answers).forEach(function (k) {
      var el = form.querySelector('input[name="q' + k + '"][value="' + state.draft.answers[k] + '"]'); if (el) { el.checked = true; }
    });
    function mark() {
      form.querySelectorAll('label.opt').forEach(function (l) { l.classList.toggle('sel', l.querySelector('input').checked); });
    }
    function answered(i) { return !!qcards[i].querySelector('input:checked'); }
    function show(i) {
      onReview = false; index = Math.max(0, Math.min(total - 1, i));
      qcards.forEach(function (c, k) { c.hidden = k !== index; });
      reviewEl.hidden = true;
      qcount.textContent = t('question', { n: index + 1, t: total });
      qmeter.firstElementChild.style.width = (100 * (index + 1) / total) + '%';
      qmeter.setAttribute('aria-valuenow', index + 1);
      prev.hidden = index === 0; next.hidden = false; submit.hidden = true;
      next.textContent = index === total - 1 ? t('review') : t('fwd');
      window.scrollTo(0, 0);
      var first = qcards[index].querySelector('input:checked') || qcards[index].querySelector('input');
      if (first) { try { first.focus({ preventScroll: true }); } catch (e) { first.focus(); } }
    }
    function showReview() {
      onReview = true; qcards.forEach(function (c) { c.hidden = true; }); reviewEl.hidden = false; list.textContent = '';
      var missing = 0;
      qcards.forEach(function (c, k) {
        var ok = answered(k); if (!ok) { missing += 1; }
        var li = document.createElement('li'), b = document.createElement('button');
        b.type = 'button'; b.className = ok ? 'ok' : 'miss';
        b.textContent = t(ok ? 'qAnswered' : 'qNotAnswered', { n: k + 1 });
        b.addEventListener('click', function () { show(k); });
        li.appendChild(b); list.appendChild(li);
      });
      note.textContent = missing ? t('missing', { n: missing }) : t('allDone');
      qcount.textContent = t('check'); qmeter.firstElementChild.style.width = '100%';
      prev.hidden = false; next.hidden = true; submit.hidden = false;
      window.scrollTo(0, 0); submit.focus();
    }
    form.addEventListener('change', function (e) {
      var m = /^q(\d+)$/.exec(e.target.name || '');
      if (m) { state.draft.answers[m[1]] = parseInt(e.target.value, 10); save(); }
      mark();
    });
    prev.addEventListener('click', function () { if (onReview) { show(total - 1); } else { show(index - 1); } });
    next.addEventListener('click', function () { if (index === total - 1) { showReview(); } else { show(index + 1); } });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!onReview) { showReview(); return; }
      submit.disabled = true;
      var g = Core.grade(course, state.draft.answers);
      state.attempts.push({ attempt_no: state.draft.attempt_no, lang: state.draft.lang || lang, started_at: state.draft.started_at,
        submitted_at: nowIso(), items: g.items, earned: g.earned, possible: g.possible, pct_text: g.pct_text,
        must_get_right_ok: g.must_get_right_ok, passed: g.passed, review_done_at: null,
        shuffle_seed: state.draft.shuffle_seed });
      state.draft = null; save();
      go('#/result');
    });
    mark(); show(0);
  }

  // ---- the result page --------------------------------------------------------------------------
  function viewResult() {
    var last = lastAttempt();
    if (!last) { go('#/step/5'); return; }
    var need = Core.needed(course), html = '<div class="quiz-wrap">';
    if (last.passed) {
      html += '<div class="banner pass"><div class="score">' + esc(t('passed')) + '</div><div class="muted">' + esc(t('ofCorrect', { c: last.earned, t: last.possible })) + '</div></div>' +
        '<div class="actions"><a class="btn primary" href="#/step/6">' + esc(t('goFinalAck')) + '</a></div>';
    } else if (!attemptsLeft()) {
      html += '<div class="banner fail"><div class="score">' + esc(t('notPassed')) + '</div><div class="muted">' + esc(t('mcLine', { c: last.earned, t: last.possible, n: need })) + '</div></div>' +
        '<div class="notice warn"><b>' + esc(t('supNeeded')) + '</b> ' + esc(t('supText')) + '</div>' + feedbackHtml(last) +
        attemptRecordBlock() + '<div class="actions"><a class="btn primary" href="#/step/5">' + esc(t('backToCourse')) + '</a></div>';
    } else {
      html += '<div class="banner fail"><div class="score">' + esc(t('notPassed')) + '</div><div class="muted">' + esc(t('mcLine', { c: last.earned, t: last.possible, n: need })) + '</div></div>' +
        '<p>' + esc(t('oneMore')) + '</p>' + feedbackHtml(last) +
        '<div class="actions"><a class="btn primary" href="#/step/5">' + esc(t('continueBtn')) + '</a></div>';
    }
    app.innerHTML = (PREVIEW ? '<div class="notice info" role="note"><b>' + esc(t('previewNote')) + '</b></div>' : '') + html + '</div>';
    wireCommon();
  }

  // ---- step 6: the acknowledgment and the completion record --------------------------------------
  function record() {
    if (state.record) { return state.record; }
    return null;
  }
  function stepFinal(s) {
    var html = '<div class="card"><h2>' + esc(L(s.title)) + '</h2>', ackText = L(course.acknowledgment.text);
    if (state.ack) {
      var rec = record(), pa = passedAttempt();
      html += '<div class="banner pass"><div class="score">' + esc(t('courseComplete')) + '</div><div class="muted">' +
        esc(t('recordedAt', { d: datePart(state.ack.accepted_at), t: timePart(state.ack.accepted_at) })) + '</div></div>' +
        '<p class="muted">' + esc(t('yourAck')) + '</p><blockquote class="ack-text">' + esc(state.ack.text_shown) + '</blockquote>' +
        '<ul class="facts">' + (wiReleased() ? releasedDocs().map(function (d) { return '<li>' + esc(docLine(d).text) + '</li>'; }).join('')
          : '<li>' + esc(t('factWINA')) + '</li>') +
        '<li>' + esc(t('factChapters', { n: course.chapters.length })) + '</li>' +
        '<li>' + esc(t('factPassed', { p: pa.pct_text })) + '</li></ul></div>' + recordCard(rec, true);
      return html;
    }
    if (passedAttempt()) {
      html += '<p>' + esc(L(s.body)) + '</p><blockquote class="ack-text">' + esc(ackText) + '</blockquote>' +
        '<form data-ackform novalidate><div class="field"><label for="ackname">' + esc(t('yourName')) + '</label>' +
        '<input type="text" id="ackname" name="name" autocomplete="name" maxlength="80" required aria-describedby="acknamehint">' +
        '<p class="muted small-note" id="acknamehint">' + esc(t('nameHint')) + '</p></div>' +
        '<div class="field"><label for="ackdate">' + esc(t('dateLbl')) + '</label><input type="text" id="ackdate" readonly value="' + esc(datePart(nowIso())) + '"></div>' +
        '<label class="check"><input type="checkbox" name="accept" value="yes" required><span>' + esc(t('thatsTrue')) + '</span></label>' +
        '<p class="muted small-note">' + esc(t('savedNote')) + '</p><p class="notice err" data-ackmsg hidden role="alert"></p>' +
        '<div class="actions"><button class="btn primary" type="submit">' + esc(t('finish')) + '</button></div></form>';
    } else {
      html += '<div class="notice info">' + esc(t('opensAfterPass')) + '</div><blockquote class="ack-text muted-block">' + esc(ackText) + '</blockquote>';
    }
    return html + '</div>';
  }
  function wireFinal() {
    var form = app.querySelector('[data-ackform]');
    if (!form) { return; }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = form.querySelector('[data-ackmsg]');
      var name = form.elements.name.value.replace(/\s+/g, ' ').trim();
      if (name.length < 3 || !/[A-Za-zÀ-ÿ]/.test(name)) { msg.textContent = t('nameNeeded'); msg.hidden = false; form.elements.name.focus(); return; }
      if (!form.elements.accept.checked) { msg.textContent = t('tickFinish'); msg.hidden = false; return; }
      var at = nowIso();
      state.ack = { typed_name: name, typed_date: datePart(at), accepted_at: at, lang: lang, text_shown: L(course.acknowledgment.text) };
      state.lang = lang;
      state.record = Core.finalize(Core.buildRecord(course, state), course.code_prefix);
      save(); render();
    });
  }

  function recordCard(rec, complete) {
    var pa = passedAttempt(), last = lastAttempt();
    var rows = [
      [t('f_course'), course.course_id + ' · ' + L(course.title)],
      [t('f_version'), course.version_label],
      [t('f_lang'), T[rec.lang] ? T[rec.lang].langName : rec.lang]
    ];
    if (complete) {
      rows.push([t('f_name'), rec.learner.typed_name], [t('f_date'), datePart(rec.completed_at) + ' ' + timePart(rec.completed_at)]);
    }
    var a = pa || last;
    if (a) {
      rows.push([t('f_score'), t('ofCorrect', { c: a.earned, t: a.possible }) + ' (' + a.pct_text + '%)'],
        [t('f_result'), a.passed ? t('passed') : t('notPassed')],
        [t('f_mgr'), a.must_get_right_ok ? t('bothRight') : t('notPassed')],
        [t('f_attempts'), String(state.attempts.length)]);
    }
    if (rec.badge_number) { rows.push([t('f_code'), t('codeEnding', { c: rec.badge_number })]); }
    rows.push([t('f_record'), rec.record_id]);
    return '<div class="card" data-recordcard><h2>' + esc(complete ? t('completionRecord') : t('attemptRecord')) + '</h2>' +
      (rec.preview ? '<div class="notice info"><b>' + esc(t('previewNote')) + '</b></div>' : '') +
      '<p>' + esc(t('completionCode')) + ':</p><p><span class="code" data-code>' + esc(rec.completion_code) + '</span></p>' +
      '<table class="record"><tbody>' + rows.map(function (r) { return '<tr><th scope="row">' + esc(r[0]) + '</th><td>' + esc(r[1]) + '</td></tr>'; }).join('') + '</tbody></table>' +
      (emailTo() && !rec.preview ? '<div class="notice info" role="note">' + esc(t('emailHow')) + '</div>' +
        '<div class="actions no-print"><button type="button" class="btn primary" data-emailrec>' + esc(t('emailBtn')) + '</button></div>' +
        '<p class="muted small-note">' + esc(t('emailBackup', { a: emailTo() })) + '</p>'
        : '<div class="notice warn" role="note">' + esc(complete ? t('notSent') : t('attemptRecordNote')) + '</div>') +
      '<div class="actions no-print"><button type="button" class="btn" data-print>' + esc(t('print')) + '</button>' +
      '<button type="button" class="btn' + (emailTo() && !rec.preview ? '' : ' primary') + '" data-download>' + esc(complete ? t('download') : t('downloadAttempt')) + '</button>' +
      '<button type="button" class="btn" data-copy>' + esc(t('copy')) + '</button></div>' +
      '<p class="muted" data-copymsg role="status" aria-live="polite"></p></div>';
  }
  function attemptRecordBlock() {
    // Both attempts used. Not a completion; the supervisor gets the attempts on paper or as a file.
    var rec = Core.finalize(Core.buildRecord(course, state), course.code_prefix);
    currentRecord = rec;
    return recordCard(rec, false);
  }
  var currentRecord = null;

  // ---- email the finished record to ICF -------------------------------------------------------------
  // The page cannot send anything itself. The button opens the learner's own mail app with a message to
  // course.submit.mailto already written; the learner taps Send, so it goes from their address. The record
  // travels as one text block (deflate + base64url when the browser can compress, plain base64url
  // otherwise). The importer decodes it, re-grades it and checks the checksum.
  function emailTo() { var a = course.submit && course.submit.mailto; return (typeof a === 'string' && /^[^@\s]+@icfmercantile\.com$/.test(a)) ? a : ''; }
  function b64url(bytes) {
    var bin = ''; for (var i = 0; i < bytes.length; i++) { bin += String.fromCharCode(bytes[i]); }
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function packRecord(rec) {
    var bytes = new TextEncoder().encode(JSON.stringify(rec));
    if (typeof CompressionStream === 'function') {
      var cs = new CompressionStream('deflate-raw');
      var w = cs.writable.getWriter(); w.write(bytes); w.close();
      return new Response(cs.readable).arrayBuffer().then(function (buf) { return 'ICFU1z:' + b64url(new Uint8Array(buf)); }, function () { return 'ICFU1:' + b64url(bytes); });
    }
    return Promise.resolve('ICFU1:' + b64url(bytes));
  }
  function mailtoFor(rec, packed) {
    var done = !!rec.completed_at, who = rec.learner && rec.learner.typed_name ? rec.learner.typed_name : '', badge = rec.badge_number || '';
    var subject = 'New tag training' + (done ? '' : ' attempts') + ': ' + who + ', badge ' + badge + ', ' + rec.completion_code;
    var lines = ['Training record for ICF. Send this email as it is.', '',
      'Name: ' + who, 'Badge: ' + badge, 'Course: ' + course.course_id + ' ' + course.version_label, 'Completion code: ' + rec.completion_code, '',
      '----- ICF RECORD (do not edit) -----'];
    for (var i = 0; i < packed.length; i += 64) { lines.push(packed.slice(i, i + 64)); }
    lines.push('----- END -----');
    return 'mailto:' + emailTo() + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\r\n'));
  }

  function wireRecord() {
    var rec = state.record || currentRecord;
    if (!rec) { return; }
    var em = app.querySelector('[data-emailrec]');
    if (em) { em.addEventListener('click', function () { packRecord(rec).then(function (p) { window.location.href = mailtoFor(rec, p); }); }); }
    var json = JSON.stringify(rec, null, 2);
    var p = app.querySelector('[data-print]'); if (p) { p.addEventListener('click', function () { window.print(); }); }
    var d = app.querySelector('[data-download]');
    if (d) {
      d.addEventListener('click', function () {
        var who = (rec.learner && rec.learner.typed_name ? rec.learner.typed_name : 'attempts').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '');
        var name = 'ICFU_' + course.code_prefix + '_' + (state.ack ? 'completion' : 'attempts') + '_' + who + '_' + datePart(nowIso()) + '.json';
        var blob = new Blob([json + '\n'], { type: 'application/json' });
        var url = URL.createObjectURL(blob), a = document.createElement('a');
        a.href = url; a.download = name; document.body.appendChild(a); a.click();
        setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1000);
      });
    }
    var c = app.querySelector('[data-copy]'), m = app.querySelector('[data-copymsg]');
    if (c) {
      c.addEventListener('click', function () {
        function done(ok) { m.textContent = ok ? t('copied') : t('copyFailed'); }
        if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(json).then(function () { done(true); }, function () { done(false); }); }
        else {
          var ta = document.createElement('textarea'); ta.value = json; document.body.appendChild(ta); ta.select();
          var ok = false; try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
          ta.remove(); done(ok);
        }
      });
    }
  }

  function wireCommon() {
    app.querySelectorAll('[data-jump]').forEach(function (a) {
      a.addEventListener('click', function () { sessionStorageJump = parseInt(a.getAttribute('data-jump'), 10); });
    });
    var rv = app.querySelector('[data-reviewed]');
    if (rv) {
      rv.addEventListener('click', function () { var last = lastAttempt(); last.review_done_at = nowIso(); save(); render(); });
    }
    wireRecord();
  }

  function render() {
    if (stopPlayer) { stopPlayer(); stopPlayer = null; }
    currentRecord = null;
    document.documentElement.lang = lang;
    document.title = L(course.title) + ' · ICF University';
    document.querySelectorAll('[data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-lang') === lang ? 'true' : 'false'); });
    document.querySelectorAll('[data-t]').forEach(function (el) { el.textContent = t(el.getAttribute('data-t')); });
    var home = document.querySelector('[data-home]'); if (home) { home.setAttribute('aria-label', t('home')); }
    var r = route();
    if (r.view === 'test') { viewTest(); return; }
    if (r.view === 'result') { viewResult(); return; }
    var s = course.steps[r.step - 1], kind = STEP_KIND[r.step], body;
    if (kind === 'wi') { body = stepWI(s); }
    else if (kind === 'video') { body = stepVideo(s); }
    else if (kind === 'keys') { body = stepKeys(s); }
    else if (kind === 'ready') { body = stepReady(s); }
    else if (kind === 'test') { body = stepTest(s); }
    else { body = stepFinal(s); }
    app.innerHTML = header(r.step) + body + footerNav(r.step);
    var steps = app.querySelector('[data-steps]');
    if (steps && window.matchMedia) { steps.open = window.matchMedia('(min-width: 900px)').matches; }
    if (kind === 'wi') { wireWI(); wireCode(); }
    if (kind === 'video' && hasCode()) { wireVideo(); }
    if (kind === 'final') { wireFinal(); }
    wireCommon();
  }

  function setLang(l) {
    if (l !== 'en' && l !== 'es') { return; }
    lang = l; saveLang();
    if (state && !state.ack) { state.lang = l; save(); }
    if (course) { render(); }
  }

  document.querySelectorAll('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
  });
  var homeLink = document.querySelector('[data-home]');
  if (homeLink) { homeLink.addEventListener('click', function (e) { e.preventDefault(); go('#/step/' + defaultStep()); }); }
  window.addEventListener('hashchange', function () { if (course) { render(); window.scrollTo(0, 0); } });

  try { var saved = localStorage.getItem('icfu-ext:lang'); if (saved === 'es' || saved === 'en') { lang = saved; } }
  catch (e) { storageOk = false; }

  fetch('course.json', { cache: 'no-cache' }).then(function (r) {
    if (!r.ok) { throw new Error('HTTP ' + r.status); }
    return r.json();
  }).then(function (c) {
    course = c;
    state = load(storeKey(), null) || freshState();
    if (!state.record_id) { state.record_id = Core.randomId(); }
    save();
    render();
  }).catch(function () {
    app.innerHTML = '<div class="notice err" role="alert">' + esc(T[lang].loadFail) + '</div>';
  });
})();

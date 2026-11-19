/* ICF University, static course page: the rules, with no page code in them.

   Scoring, the pass rule, the answer key check, the completion record and its checksum live here so
   the page and the Node test (assets/test_scoring.js) run the same code. The ICF University importer
   (tools/icf_university/import_external_completion.py) repeats the canonical form, the checksum and
   the content hash in Python; change one and the other must change with it.

   Pass rule, as ICF University applies it: score_pct = 100 * correct / total, passed when it is at
   least passing_score_pct (80, so 7 of 8). On top of that, every question flagged must_get_right has
   to be correct (the competency framework rule the course text states). ICF University's own
   learning.py does not enforce that second rule yet; the importer does.

   No answer is stored in plain text. Each question carries key = sha256("ICFU-KEY-1|course|version|
   question|option") cut to 16 hex characters for its correct option. That keeps answers out of plain
   view in course.json. It does not stop a determined person, who can hash four options. */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  else { root.ICFUCore = api; }
})(this, function () {
  'use strict';

  var SCHEMA_VERSION = 'icfu-external-completion/2';
  var CHECKSUM_SALT = 'ICFU-EXT-COMPLETION-1';
  var KEY_SALT = 'ICFU-KEY-1';
  var SOURCE = 'external web (GitHub Pages)';

  // ---- SHA-256 (FIPS 180-4) over the UTF-8 bytes of a string. No dependency, works offline and
  // on file:// where crypto.subtle is not always available. ------------------------------------
  var K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];

  function utf8(str) {
    var out = [];
    for (var i = 0; i < str.length; i++) {
      var c = str.charCodeAt(i);
      if (c >= 0xd800 && c <= 0xdbff && i + 1 < str.length) {
        var d = str.charCodeAt(i + 1);
        if (d >= 0xdc00 && d <= 0xdfff) { c = 0x10000 + ((c - 0xd800) << 10) + (d - 0xdc00); i++; }
      }
      if (c < 0x80) { out.push(c); }
      else if (c < 0x800) { out.push(0xc0 | (c >> 6), 0x80 | (c & 63)); }
      else if (c < 0x10000) { out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63)); }
      else { out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63)); }
    }
    return out;
  }

  function sha256(str) {
    var bytes = utf8(String(str));
    var bitLen = bytes.length * 8;
    bytes.push(0x80);
    while (bytes.length % 64 !== 56) { bytes.push(0); }
    var hi = Math.floor(bitLen / 0x100000000), lo = bitLen >>> 0;
    bytes.push((hi >>> 24) & 255, (hi >>> 16) & 255, (hi >>> 8) & 255, hi & 255,
               (lo >>> 24) & 255, (lo >>> 16) & 255, (lo >>> 8) & 255, lo & 255);
    var h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    var w = new Array(64);
    for (var off = 0; off < bytes.length; off += 64) {
      for (var t = 0; t < 16; t++) {
        var j = off + t * 4;
        w[t] = ((bytes[j] << 24) | (bytes[j + 1] << 16) | (bytes[j + 2] << 8) | bytes[j + 3]) >>> 0;
      }
      for (t = 16; t < 64; t++) {
        var x = w[t - 15], y = w[t - 2];
        var s0 = ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3);
        var s1 = ((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10);
        w[t] = (w[t - 16] + s0 + w[t - 7] + s1) >>> 0;
      }
      var a = h[0], b = h[1], c = h[2], d = h[3], e = h[4], f = h[5], g = h[6], k = h[7];
      for (t = 0; t < 64; t++) {
        var S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
        var ch = (e & f) ^ (~e & g);
        var t1 = (k + S1 + ch + K[t] + w[t]) >>> 0;
        var S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
        var mj = (a & b) ^ (a & c) ^ (b & c);
        var t2 = (S0 + mj) >>> 0;
        k = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      h[0] = (h[0] + a) >>> 0; h[1] = (h[1] + b) >>> 0; h[2] = (h[2] + c) >>> 0; h[3] = (h[3] + d) >>> 0;
      h[4] = (h[4] + e) >>> 0; h[5] = (h[5] + f) >>> 0; h[6] = (h[6] + g) >>> 0; h[7] = (h[7] + k) >>> 0;
    }
    return h.map(function (v) { return ('00000000' + v.toString(16)).slice(-8); }).join('');
  }

  // ---- canonical JSON: sorted keys, no spaces, integers only. Python's
  // json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False) gives the same text.
  function canonical(v) {
    if (v === null) { return 'null'; }
    if (typeof v === 'boolean') { return v ? 'true' : 'false'; }
    if (typeof v === 'number') {
      if (!isFinite(v) || Math.floor(v) !== v) { throw new Error('canonical: only integers are allowed, got ' + v); }
      return String(v);
    }
    if (typeof v === 'string') { return JSON.stringify(v); }
    if (Array.isArray(v)) { return '[' + v.map(canonical).join(',') + ']'; }
    if (typeof v === 'object') {
      return '{' + Object.keys(v).filter(function (k) { return v[k] !== undefined; }).sort()
        .map(function (k) { return JSON.stringify(k) + ':' + canonical(v[k]); }).join(',') + '}';
    }
    throw new Error('canonical: unsupported value');
  }

  // ---- the answer key -----------------------------------------------------------------------
  function keyFor(course, qOrdinal, optOrdinal) {
    return sha256(KEY_SALT + '|' + course.course_id + '|' + course.version_label + '|' + qOrdinal + '|' + optOrdinal).slice(0, 16);
  }

  function correctOption(course, q) {
    var hits = q.options.filter(function (o) { return keyFor(course, q.ordinal, o.ordinal) === q.key; });
    return hits.length === 1 ? hits[0].ordinal : null;
  }

  // What ICF University must hold for a record to be importable: the English questions, options,
  // correct answers, pass mark and acknowledgment wording. Same recipe as the importer.
  function contentHash(course) {
    var body = {
      course_id: course.course_id, version_label: course.version_label,
      passing_score_pct: course.passing_score_pct, max_attempts: course.max_attempts,
      ack: { text_version: course.acknowledgment.text_version, text: course.acknowledgment.text.en },
      questions: course.questions.map(function (q) {
        return { ordinal: q.ordinal, kind: q.kind, concept: q.concept.en, chapter: q.chapter,
                 prompt: q.prompt.en, options: q.options.map(function (o) { return o.en; }),
                 correct: correctOption(course, q) };
      })
    };
    return sha256(canonical(body));
  }

  // ---- scoring --------------------------------------------------------------------------------
  function pctText(earned, possible) {
    var tenths = Math.round(1000 * earned / possible);
    return tenths % 10 === 0 ? String(tenths / 10) : (tenths / 10).toFixed(1);
  }

  function needed(course) {
    return Math.ceil(course.passing_score_pct * course.questions.length / 100);
  }

  /* answers: {questionOrdinal: optionOrdinal or null}. An unanswered question counts as wrong. */
  function grade(course, answers) {
    var items = course.questions.map(function (q) {
      var sel = answers && answers[q.ordinal] != null ? parseInt(answers[q.ordinal], 10) : null;
      var ok = sel !== null && keyFor(course, q.ordinal, sel) === q.key;
      return { ordinal: q.ordinal, selected: sel, correct: ok, must_get_right: !!q.must_get_right,
               chapter: q.chapter };
    });
    var earned = items.filter(function (i) { return i.correct; }).length;
    var possible = items.length;
    var mgr = items.filter(function (i) { return i.must_get_right; });
    var mgrOk = mgr.every(function (i) { return i.correct; });
    var scoreOk = earned * 100 >= course.passing_score_pct * possible;
    return {
      items: items, earned: earned, possible: possible, pct_text: pctText(earned, possible),
      needed: needed(course), score_ok: scoreOk, must_get_right_ok: mgrOk,
      passed: scoreOk && mgrOk
    };
  }

  // Chapters to look at again after a miss: the chapter, never the answer (as ICF University does).
  function pointers(course, graded, lang) {
    var by = {};
    graded.items.forEach(function (i) {
      if (i.correct) { return; }
      var q = course.questions[i.ordinal - 1];
      var c = course.chapters[q.chapter - 1];
      var p = by[q.chapter] || (by[q.chapter] = { chapter: q.chapter, title: c.title[lang], concepts: [] });
      var label = q.concept[lang].replace(/\s*\[[^\]]*\]\s*/g, ' ').trim();
      if (p.concepts.indexOf(label) === -1) { p.concepts.push(label); }
    });
    return Object.keys(by).sort().map(function (k) { return by[k]; });
  }

  // ---- time clock badge number: format only -------------------------------------------------------
  // The page cannot tell whose badge it is: it holds no roster and no badge list. It records the
  // number the operator types. ICF University's importer checks the badge against the time clock
  // list and against the typed full name, and is the authority.
  function normalizeBadge(raw) {
    var text = String(raw || '').replace(/[\s\-_.]+/g, '');
    if (!/^[0-9]{3,4}$/.test(text)) { return null; }
    while (text.length < 4) { text = '0' + text; }
    return text;
  }

  // ---- answer order on screen ------------------------------------------------------------------
  // The options are stored with the right one first. Each attempt gets its own seed and every
  // question is shown in an order derived from (seed, question), so the right answer moves around and
  // the order can be reproduced from the record. Answers are always recorded by the stored ordinal.
  function mulberry32(a) {
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function optionOrder(seed, qOrdinal, n) {
    var rnd = mulberry32(((seed >>> 0) ^ Math.imul(qOrdinal, 0x9E3779B1)) >>> 0);
    var order = [];
    for (var i = 1; i <= n; i++) { order.push(i); }
    for (i = n - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var x = order[i]; order[i] = order[j]; order[j] = x; }
    return order;
  }
  function newSeed() {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) { var a = new Uint32Array(1); crypto.getRandomValues(a); return a[0]; }
    return Math.floor(Math.random() * 4294967296);
  }

  // ---- the completion record --------------------------------------------------------------------
  var CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

  function completionCode(prefix, checksumHex) {
    // 60 bits = the first 15 hex characters, as 12 Crockford base-32 characters in three groups.
    var bits = '';
    for (var i = 0; i < 15; i++) { bits += ('0000' + parseInt(checksumHex.charAt(i), 16).toString(2)).slice(-4); }
    var out = '';
    for (i = 0; i < 60; i += 5) { out += CROCKFORD.charAt(parseInt(bits.slice(i, i + 5), 2)); }
    return prefix + '-' + out.slice(0, 4) + '-' + out.slice(4, 8) + '-' + out.slice(8, 12);
  }

  function stripForChecksum(rec) {
    var copy = {};
    Object.keys(rec).forEach(function (k) { if (k !== 'checksum' && k !== 'completion_code') { copy[k] = rec[k]; } });
    return copy;
  }

  function checksumOf(rec) {
    return sha256(CHECKSUM_SALT + '|' + canonical(stripForChecksum(rec)));
  }

  function finalize(rec, prefix) {
    var sum = checksumOf(rec);
    rec.checksum = { alg: 'sha256', salt_id: CHECKSUM_SALT, value: sum };
    rec.completion_code = completionCode(prefix, sum);
    return rec;
  }

  function verify(rec, prefix) {
    if (!rec || !rec.checksum || rec.checksum.salt_id !== CHECKSUM_SALT) { return false; }
    var sum = checksumOf(rec);
    return sum === rec.checksum.value && rec.completion_code === completionCode(prefix, sum);
  }

  function isoLocal(d) {
    function p(n) { return (n < 10 ? '0' : '') + n; }
    var off = -d.getTimezoneOffset(), sign = off >= 0 ? '+' : '-';
    off = Math.abs(off);
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + 'T' + p(d.getHours()) + ':' +
      p(d.getMinutes()) + ':' + p(d.getSeconds()) + sign + p(Math.floor(off / 60)) + ':' + p(off % 60);
  }

  function randomId() {
    var bytes = [];
    var c = (typeof crypto !== 'undefined' && crypto.getRandomValues) ? crypto : null;
    if (c) { var a = new Uint8Array(16); c.getRandomValues(a); for (var i = 0; i < 16; i++) { bytes.push(a[i]); } }
    else { for (i = 0; i < 16; i++) { bytes.push(Math.floor(Math.random() * 256)); } }
    return bytes.map(function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
  }

  /* state: what the page keeps (see app.js). Returns the unsigned record; call finalize() on it. */
  function buildRecord(course, state) {
    var last = state.attempts[state.attempts.length - 1];
    return {
      schema_version: SCHEMA_VERSION,
      record_id: state.record_id,
      source: SOURCE,
      preview: !!state.preview,
      course: { course_id: course.course_id, version_label: course.version_label,
                title: course.title.en, content_hash: contentHash(course),
                passing_score_pct: course.passing_score_pct, max_attempts: course.max_attempts },
      lang: state.ack ? state.ack.lang : state.lang,
      learner: { typed_name: state.ack ? state.ack.typed_name : null },
      badge_number: state.badge || null,
      started_at: state.started_at,
      completed_at: state.ack ? state.ack.accepted_at : null,
      documents: (state.documents || []).map(function (d) {
        return { role: d.role, doc_number: d.doc_number, revision: d.revision, release_state: d.release_state,
                 opened_at: d.opened_at || null, acknowledged_at: d.acknowledged_at || null,
                 ack_text_version: d.ack_text_version || null, ack_text_shown: d.ack_text_shown || null,
                 lang: d.lang || null };
      }),
      chapters: state.chapters.map(function (c) {
        return { ordinal: c.ordinal, completed_at: c.completed_at, lang: c.lang, frontier_ms: c.frontier_ms };
      }),
      attempts: state.attempts.map(function (t) {
        var seed = typeof t.shuffle_seed === 'number' ? t.shuffle_seed : null;
        return { attempt_no: t.attempt_no, lang: t.lang, started_at: t.started_at, submitted_at: t.submitted_at,
                 review_done_at: t.review_done_at || null, shuffle_seed: seed,
                 answers: t.items.map(function (i) {
                   var q = course.questions[i.ordinal - 1];
                   return { ordinal: i.ordinal, selected: i.selected, correct: i.correct,
                            shown_order: seed === null ? null : optionOrder(seed, i.ordinal, q.options.length) };
                 }),
                 points_earned: t.earned, points_possible: t.possible, score_pct_text: t.pct_text,
                 must_get_right_ok: t.must_get_right_ok, outcome: t.passed ? 'PASSED' : 'FAILED' };
      }),
      result: last ? { passed: !!last.passed, attempt_no: last.attempt_no, points_earned: last.earned,
                       points_possible: last.possible, score_pct_text: last.pct_text,
                       must_get_right_ok: last.must_get_right_ok } : null,
      acknowledgment: state.ack ? { text_version: course.acknowledgment.text_version, lang: state.ack.lang,
                                    text_shown: state.ack.text_shown, text_en: course.acknowledgment.text.en,
                                    accepted: true, typed_name: state.ack.typed_name,
                                    typed_date: state.ack.typed_date, accepted_at: state.ack.accepted_at } : null
    };
  }

  return {
    SCHEMA_VERSION: SCHEMA_VERSION, CHECKSUM_SALT: CHECKSUM_SALT, SOURCE: SOURCE,
    sha256: sha256, canonical: canonical, keyFor: keyFor, correctOption: correctOption,
    contentHash: contentHash, grade: grade, needed: needed, pctText: pctText, pointers: pointers,
    completionCode: completionCode, checksumOf: checksumOf, finalize: finalize, verify: verify,
    buildRecord: buildRecord, isoLocal: isoLocal, randomId: randomId,
    optionOrder: optionOrder, newSeed: newSeed,
    normalizeBadge: normalizeBadge
  };
});

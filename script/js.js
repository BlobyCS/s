const obs = new IntersectionObserver(es => es.forEach((e,i) => {
  if (e.isIntersecting) { setTimeout(() => e.target.classList.add('in'), i*60); obs.unobserve(e.target); }
}), { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
 
document.getElementById('toLang').addEventListener('change', () => {
  const v = document.getElementById('toLang').value;
  const t = document.getElementById('outTag');
  t.textContent = v === 'javascript' ? 'js' : 'py';
  t.className = 'plang ' + (v === 'javascript' ? 'js' : 'py');
});
 
function translate(src, lang) {
  let out = src;
  if (lang === 'javascript') {
    out = out.replace(/^(package|import)\s+[^;\n]*;?\n?/gm, '');
    out = out.replace(/public\s+class\s+\w+\s*\{/, '');
    out = out.replace(/public\s+static\s+void\s+main\s*\(String\[\]\s*\w+\)\s*\{/, 'function main() {');
    out = out.replace(/^\}\s*$/m, '');
    out = out.replace(/\b(int|long|double|float|boolean|String)\s+(\w+)\s*=/g, (_, _t, v) => `const ${v} =`);
    out = out.replace(/for\s*\(\s*int\s+(\w+)/g, 'for (let $1');
    out = out.replace(/System\.out\.println\s*\(/g, 'console.log(');
    out = out.replace(/^\s*;\s*$/gm, '');
    out = out.trim() + '\n\nmain();';
  } else {
    out = out.replace(/^(package|import)\s+[^;\n]*;?\n?/gm, '');
    out = out.replace(/public\s+class\s+\w+\s*\{/, '');
    out = out.replace(/public\s+static\s+void\s+main\s*\(String\[\]\s*\w+\)\s*\{/, 'def main():');
    out = out.replace(/^\}\s*$/gm, '');
    out = out.replace(/\b(int|long|double|float|boolean|String)\s+/g, '');
    out = out.replace(/for\s*\(\s*(\w+)\s*=\s*(\d+);\s*\1\s*<\s*(\w+);\s*\1\+\+\)/g, (_, v, s, e) => `for ${v} in range(${s}, ${e})`);
    out = out.replace(/System\.out\.println\s*\(/g, 'print(');
    out = out.replace(/true/g,'True').replace(/false/g,'False').replace(/null/g,'None');
    out = out.replace(/;/g, '');
    out = out.replace(/\)\s*\{/g, '):').replace(/[{}]/g, '');
    const lines = out.split('\n'); let depth = 0, res = [];
    for (const l of lines) {
      const t = l.trim();
      if (!t) { res.push(''); continue; }
      if (/^(def |for |if |while )/.test(t)) {
        res.push('    '.repeat(depth) + t);
        if (t.endsWith(':')) depth++;
      } else { res.push('    '.repeat(depth) + t); }
    }
    out = res.join('\n').trim() + '\n\nmain()';
  }
  return out.trim();
}
 
function doTranslate() {
  const src = document.getElementById('inputCode').value.trim();
  if (!src) { toast('Vlož Java kód'); return; }
  const btn = document.getElementById('runBtn');
  const out = document.getElementById('outputCode');
  const lang = document.getElementById('toLang').value;
  btn.classList.add('busy');
  setTimeout(() => {
    out.textContent = translate(src, lang);
    out.classList.remove('empty');
    btn.classList.remove('busy');
    toast('Přeloženo');
  }, 380);
}
 
document.getElementById('inputCode').addEventListener('keydown', e => {
  if (e.ctrlKey && e.key === 'Enter') doTranslate();
});
 
function copyOut() {
  const t = document.getElementById('outputCode').textContent;
  if (!t || t === '← stiskni Run') { toast('Nejprve přelož'); return; }
  navigator.clipboard.writeText(t).then(() => toast('Zkopírováno'));
}
function copyCode(id) {
  const el = document.getElementById(id);
  if (el) navigator.clipboard.writeText(el.innerText).then(() => toast('Zkopírováno'));
}
let tid;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg; el.classList.add('show');
  clearTimeout(tid); tid = setTimeout(() => el.classList.remove('show'), 2000);
}

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync(require('node:path').join(__dirname, '..', 'index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script, 'inline application script exists');

function makePage(fetch) {
  const input = { value: '', disabled: false, addEventListener() {} };
  const results = { style: {}, innerHTML: '' };
  const document = {
    getElementById(id) {
      if (id === 'searchInput') return input;
      if (id === 'results') return results;
      throw new Error(`Unexpected element: ${id}`);
    }
  };
  const errors = [];
  const context = { document, fetch, console: { error: (...args) => errors.push(args) } };
  vm.runInNewContext(script.replace('loadKnowledgeBase();', ''), context);
  return { context, input, results, errors };
}

(async () => {
  const csv = [
    'ID,Type,Category,Question/Title,Answer,Status,AI draft answer',
    '1,FAQ,Policy,"What, when?","Safe answer",Approved,"AI draft answer must not be shown"',
    '2,FAQ,Policy,Review item,"Hidden answer",Needs Review,"Draft for review"',
    '3,FAQ,Policy,Blank status row,"Do not publish",,"Unused draft"',
    '4,FAQ,Policy,Unsafe HTML,"<script>alert(1)</script>",Approved,"Different draft"',
    '5,FAQ,Policy,Uppercase approval,"Case insensitive answer",APPROVED,"Unused draft"',
    '6,FAQ,Policy,Missing approved answer,,Approved,"Draft without approved answer"'
  ].join('\n');
  const page = makePage(async () => ({ ok: true, text: async () => csv }));
  await page.context.loadKnowledgeBase();
  assert.equal(vm.runInNewContext('data.length', page.context), 3, 'only rows with explicit approval and an approved answer are loaded');
  assert.equal(vm.runInNewContext('data.some(item => item.answer === "Do not publish")', page.context), false, 'blank approval status fails closed');
  assert.equal(vm.runInNewContext('data.some(item => item.answer === "Draft without approved answer")', page.context), false, 'an AI draft is never used as a fallback for a missing approved answer');
  assert.equal(page.input.disabled, false, 'search unlocks after a successful load');
  page.input.value = 'when';
  page.context.searchKB();
  assert.match(page.results.innerHTML, /Safe answer/, 'search returns approved CSV content');
  assert.doesNotMatch(page.results.innerHTML, /AI draft answer must not be shown|Hidden answer|Do not publish/, 'search excludes draft content, unapproved content, and blank-status rows');
  page.input.value = 'Unsafe HTML';
  page.context.searchKB();
  assert.match(page.results.innerHTML, /&lt;script&gt;/, 'search output escapes HTML from the source');
  assert.doesNotMatch(page.results.innerHTML, /<script>/, 'source content cannot inject a script');

  const failedPage = makePage(async () => { throw new Error('offline'); });
  await failedPage.context.loadKnowledgeBase();
  assert.match(failedPage.results.innerHTML, /temporarily unavailable/, 'failed loads show an explicit error state');
  assert.equal(failedPage.input.disabled, true, 'search stays unavailable when the knowledge base cannot load');
  assert.equal(failedPage.errors.length, 1, 'failed loads are logged for debugging');
  console.log('Prototype smoke checks passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });

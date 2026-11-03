import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const code=readFileSync(new URL('../blocks/siwak-product-offers.liquid',import.meta.url),'utf8').split('{% javascript %}')[1].split('{% endjavascript %}')[0];
function setup() {
 const controls=()=>({listeners:{},addEventListener(name,fn){this.listeners[name]=fn;}});
 const dialog={...controls(),open:false,showModal(){this.open=true;},close(){this.open=false;}};
 const confirm=controls(),cancel=controls(),open=controls(),summary={},count={};
 const gift={value:'56449444544894',dataset:{title:'eBook'},disabled:false,checked:false};
 const quantity={value:'4'};
 const registry=new Map();
 const context=vm.createContext({HTMLElement:class {addEventListener(){}},AbortController,MutationObserver:class {observe(){} disconnect(){}},customElements:{get:n=>registry.get(n),define:(n,c)=>registry.set(n,c)}});
 vm.runInContext(code,context);
 const offer=new (registry.get('siwak-product-offers'))();
 const submissions=[];
 const form={requestSubmit(button){if(offer.prepareSubmission(button)) submissions.push({gift:offer.gift?.value,button});}};
 const button={form,disabled:false};
 offer.isConnected=true;
 offer.closest=()=>({querySelector:()=>form});
 offer.querySelector=selector=>selector==='dialog'?dialog:selector==='[data-confirm]'?confirm:selector==='[data-gift-count]'?count:selector==='[data-gift-summary]'?summary:selector==='.siwak-product-offers__gift-open'?open:selector.includes('input[name^="siwak-quantity"]')?quantity:selector.includes('input:checked')?(gift.checked?gift:null):null;
 offer.querySelectorAll=selector=>selector==='[data-close]'?[cancel]:[gift];
 offer.syncForm=()=>{};
 offer.initialize();
 return {offer,dialog,confirm,cancel,open,gift,quantity,form,button,submissions};
}
test('add first waits; confirming the gift resumes exactly one submission',()=>{
 const s=setup();s.form.requestSubmit(s.button);assert.equal(s.submissions.length,0);assert.equal(s.dialog.open,true);
 s.gift.checked=true;s.confirm.listeners.click();assert.equal(s.submissions.length,1);assert.equal(s.submissions[0].gift,s.gift.value);assert.equal(s.submissions[0].button,s.button);assert.equal(s.dialog.open,false);assert.equal(s.offer.pendingSubmission,false);
});
test('manually selecting a gift does not submit; the next add includes it',()=>{
 const s=setup();s.open.listeners.click();s.gift.checked=true;s.confirm.listeners.click();assert.equal(s.submissions.length,0);s.form.requestSubmit(s.button);assert.equal(s.submissions.length,1);assert.equal(s.dialog.open,false);
});
test('cancel and Escape discard the pending add',()=>{
 for(const escape of [false,true]){const s=setup();s.form.requestSubmit(s.button);if(escape)s.dialog.listeners.cancel();else s.cancel.listeners.click();s.gift.checked=true;s.confirm.listeners.click();assert.equal(s.submissions.length,0);}
});
test('empty or disabled gift cannot confirm a pending add',()=>{
 const s=setup();s.form.requestSubmit(s.button);s.confirm.listeners.click();assert.equal(s.dialog.open,true);assert.equal(s.submissions.length,0);s.gift.checked=true;s.gift.disabled=true;s.confirm.listeners.click();assert.equal(s.submissions.length,0);
});
test('lower offers do not require a gift',()=>{const s=setup();s.quantity.value='2';s.form.requestSubmit(s.button);assert.equal(s.submissions.length,1);assert.equal(s.dialog.open,false);});

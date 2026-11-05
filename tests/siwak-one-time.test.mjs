import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const source = readFileSync(new URL('../blocks/siwak-product-offers.liquid',import.meta.url),'utf8').split('{% javascript %}')[1].split('{% endjavascript %}')[0];
test('all three lots remove selling plans and synchronize both prices and CTAs', () => {
  const registry=new Map();
  const context=vm.createContext({HTMLElement:class{},Intl,customElements:{get:n=>registry.get(n),define:(n,c)=>registry.set(n,c)},document:{documentElement:{lang:'fr'},createElement:()=>({})}});
  vm.runInContext(source,context);
  for (const quantity of ['1','2','4']) {
    const offer=new (registry.get('siwak-product-offers'))();
    const elements=[{name:'quantity',value:'2'},{name:'selling_plan',value:'old-plan'}];
    elements[1].remove=()=>elements.splice(1,1);
    const prices=[{textContent:'12 €'},{textContent:'12 €'}];
    const labels=[{textContent:'Ajouter au panier'},{textContent:'Ajouter au panier'}];
    const form={elements,querySelector:()=>elements[0],querySelectorAll:()=>elements.filter(e=>e.name==='selling_plan'),append:el=>elements.push(el)};
    offer.form=form;
    offer.dataset={unitCents:'1200',currency:'EUR',cta:'Ajouter au panier'};
    offer.gift={title:'Cadeau',value:'56866953396606'};
    offer.querySelector=()=>({value:quantity});
    offer.querySelectorAll=()=>[];
    offer.closest=()=>({querySelectorAll:selector=>selector.includes('bdi')?prices:selector.includes('compare-at')?[]:labels});
    offer.syncForm();
    const amount=new Intl.NumberFormat('fr',{style:'currency',currency:'EUR'}).format(Number(quantity)*12);
    assert.equal(elements[0].value,quantity);
    assert.ok(!elements.some(e=>e.name==='selling_plan'));
    assert.ok(prices.every(p=>p.textContent===amount));
    assert.ok(labels.every(p=>p.textContent===`Ajouter au panier — ${amount}`));
    assert.equal(elements.find(e=>e.name==='properties[_optiz_gift_variant]')?.value,quantity==='4'?'56866953396606':undefined);
  }
});

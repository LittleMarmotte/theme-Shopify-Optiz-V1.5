import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planSiwakAdditions, planSiwakGiftUpdates, SIWAK_VARIANT_ID as paid, SIWAK_CASE_VARIANT_ID as holder } from '../assets/siwak-offer-cart.js';
const gift='56866953396606';
const line=(id,quantity,properties={},key=id)=>({variant_id:id,quantity,properties,key});
test('one box has no bonus; two boxes add exactly one case',()=>{
 assert.deepEqual(planSiwakAdditions({items:[]},paid,1,null),[]);
 const additions=planSiwakAdditions({items:[]},paid,2,null);
 assert.equal(additions.length,1);assert.equal(additions[0].id,holder);assert.equal(additions[0].quantity,1);assert.equal(additions[0].selling_plan,undefined);
});
test('four boxes add the case and chosen gift as one-time lines',()=>{
 const additions=planSiwakAdditions({items:[]},paid,4,gift);
 assert.deepEqual(additions.map(a=>a.id),[holder,gift]);assert.ok(additions.every(a=>!('selling_plan' in a)));
});
test('repeat purchases do not duplicate marked rewards',()=>{
 const cart={items:[line(paid,4),line(holder,1,{_optiz_siwak_case:'true'}),line(gift,1,{_optiz_siwak_gift:'true'})]};
 assert.deepEqual(planSiwakAdditions(cart,paid,4,gift),[]);
});
test('retail cases and unapproved gifts are never treated as free gifts',()=>{
 const additions=planSiwakAdditions({items:[line(holder,1)]},paid,4,'unapproved');
 assert.equal(additions.length,1);assert.equal(additions[0].properties._optiz_siwak_case,'true');
 assert.deepEqual(planSiwakGiftUpdates({items:[line(holder,2),line(gift,2)]}),{});
});
test('dropping from four to two removes only the Optiz gift',()=>{
 const items=[line(paid,2),line(holder,1,{_optiz_siwak_case:'true'}),line(gift,1,{_optiz_siwak_gift:'true'})];
 assert.deepEqual(planSiwakGiftUpdates({items}),{[gift]:0});
 items[0].quantity=1;assert.deepEqual(planSiwakGiftUpdates({items}),{[holder]:0,[gift]:0});
});
test('duplicate and inflated rewards are clamped without touching retail lines',()=>{
 const cart={items:[line(paid,4),line(holder,3,{_optiz_siwak_case:'true'},'case1'),line(holder,1,{_optiz_siwak_case:'true'},'case2'),line(gift,2,{_optiz_siwak_gift:'true'},'gift1'),line(gift,1,{},'retail')]};
 assert.deepEqual(planSiwakGiftUpdates(cart),{case1:1,case2:0,gift1:1});
});
test('other products never trigger Siwak rewards',()=>assert.deepEqual(planSiwakAdditions({items:[]},'other',4,gift),[]));

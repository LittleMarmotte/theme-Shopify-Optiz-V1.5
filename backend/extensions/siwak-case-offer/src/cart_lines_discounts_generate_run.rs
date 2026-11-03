use super::schema;
use shopify_function::prelude::*;
use shopify_function::Result;

const SIWAK_ID: &str = "gid://shopify/ProductVariant/56366142259582";
const CASE_ID: &str = "gid://shopify/ProductVariant/58340156768638";
const GIFT_IDS: [&str; 6] = [
    "gid://shopify/ProductVariant/56866953396606",
    "gid://shopify/ProductVariant/56366150680958",
    "gid://shopify/ProductVariant/56366116241790",
    "gid://shopify/ProductVariant/57856612565374",
    "gid://shopify/ProductVariant/56421695390078",
    "gid://shopify/ProductVariant/56449444544894",
];

#[shopify_function]
fn cart_lines_discounts_generate_run(
    input: schema::cart_lines_discounts_generate_run::Input,
) -> Result<schema::CartLinesDiscountsGenerateRunResult> {
    if !input.discount().discount_classes().contains(&schema::DiscountClass::Product) {
        return Ok(schema::CartLinesDiscountsGenerateRunResult { operations: vec![] });
    }
    let mut quantity = 0;
    let mut case_line = None;
    let mut gift_line = None;
    for line in input.cart().lines() {
        let schema::cart_lines_discounts_generate_run::input::cart::lines::Merchandise::ProductVariant(variant) = line.merchandise() else { continue; };
        if variant.id() == SIWAK_ID {
            quantity += line.quantity();
        }
        if line.selling_plan_allocation().is_some() || *line.quantity() < 1 { continue; }
        if variant.id() == CASE_ID && case_line.is_none()
            && line.case_marker().as_ref().and_then(|a| a.value()).map(|value| value.as_str()) == Some("true") {
            case_line = Some(line.id().clone());
        }
        if GIFT_IDS.contains(&variant.id().as_str()) && gift_line.is_none()
            && line.gift_marker().as_ref().and_then(|a| a.value()).map(|value| value.as_str()) == Some("true") {
            gift_line = Some(line.id().clone());
        }
    }
    let mut candidates = vec![];
    if quantity >= 2 {
        if let Some(id) = case_line { candidates.push(free_gift(id, "Étui Siwak offert")); }
    }
    if quantity >= 4 {
        if let Some(id) = gift_line { candidates.push(free_gift(id, "Cadeau Optiz offert")); }
    }
    if candidates.is_empty() {
        return Ok(schema::CartLinesDiscountsGenerateRunResult { operations: vec![] });
    }
    Ok(schema::CartLinesDiscountsGenerateRunResult {
        operations: vec![schema::CartOperation::ProductDiscountsAdd(schema::ProductDiscountsAddOperation {
            selection_strategy: schema::ProductDiscountSelectionStrategy::All,
            candidates,
        })],
    })
}

fn free_gift(id: String, message: &str) -> schema::ProductDiscountCandidate {
    schema::ProductDiscountCandidate {
        targets: vec![schema::ProductDiscountCandidateTarget::CartLine(schema::CartLineTarget {
            id, quantity: Some(1),
        })],
        message: Some(message.to_string()),
        value: schema::ProductDiscountCandidateValue::Percentage(schema::Percentage { value: Decimal(100.0) }),
        associated_discount_code: None,
        prerequisites: None,
    }
}

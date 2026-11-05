// @ts-check

/**
 * @typedef {import("../generated/api").CartDeliveryOptionsTransformRunInput} CartDeliveryOptionsTransformRunInput
 * @typedef {import("../generated/api").CartDeliveryOptionsTransformRunResult} CartDeliveryOptionsTransformRunResult
 * @typedef {import("../generated/api").Operation} Operation
 */

/**
 * Shipping rate titles reserved for B2B customers (matched case-insensitively).
 */
const B2B_RATE_NAMES = [
  "UPS® Ground",
  "FedEx Ground®",
  "FedEx Home Delivery®",
  "Priority Mail"
];

const B2B_RATE_NAME_SET = new Set(B2B_RATE_NAMES.map(normalize));

/**
 * @param {string | null | undefined} value
 */
function normalize(value) {
  return (value ?? "").trim().toLowerCase();
}

/**
 * @param {{ title?: string | null }} option
 */
function isB2BRate(option) {
  return B2B_RATE_NAME_SET.has(normalize(option.title));
}

/**
 * @param {string} handle
 * @returns {Operation}
 */
function hide(handle) {
  return { deliveryOptionHide: { deliveryOptionHandle: handle } };
}

/**
 * B2B buyers only see B2B rates; everyone else never sees them.
 *
 * @param {CartDeliveryOptionsTransformRunInput} input
 * @returns {CartDeliveryOptionsTransformRunResult}
 */
export function cartDeliveryOptionsTransformRun(input) {
  const isB2BBuyer = Boolean(input.cart.buyerIdentity?.purchasingCompany);

  const operations = input.cart.deliveryGroups.flatMap((group) => {
    const options = group.deliveryOptions;

    if (!isB2BBuyer) {
      return options.filter(isB2BRate).map((option) => hide(option.handle));
    }

    return options
      .filter((option) => !isB2BRate(option))
      .map((option) => hide(option.handle));
  });

  return { operations };
};

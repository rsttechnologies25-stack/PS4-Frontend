const testCartCalculations = () => {
    // Mock user cart data
    const totalAmount = 500; // Rs. 500 (e.g. Sweets)
    const discountAmount = 50; // Rs. 50 Coupon 
    const shippingFee = 100; // Rs. 100 Shipping

    console.log("----- Test Cart Values -----");
    console.log("Initial Subtotal: ₹" + totalAmount);
    console.log("Coupon Discount: -₹" + discountAmount);
    console.log("Shipping: ₹" + shippingFee);

    const finalTotal = totalAmount - discountAmount + shippingFee;
    console.log("\nGrand Total (what user pays): ₹" + finalTotal);

    console.log("\n----- Inclusive Tax Breakdown Calculations -----");
    // GST Math implemented in page.tsx
    const discountedProductTotal = totalAmount - discountAmount;
    const productBaseTotal = discountedProductTotal / 1.05;
    const productGST = discountedProductTotal - productBaseTotal;

    const shippingBase = shippingFee > 0 ? (shippingFee / 1.18) : 0;
    const shippingGST = shippingFee > 0 ? (shippingFee - shippingBase) : 0;

    const totalCGST = (productGST + shippingGST) / 2;
    const totalSGST = (productGST + shippingGST) / 2;

    console.log("Discounted Product Total: ₹" + discountedProductTotal);
    console.log("Product Base (without 5% GST): ₹" + productBaseTotal.toFixed(2));
    console.log("Product GST Component (5%): ₹" + productGST.toFixed(2));

    console.log("\nShipping Base (without 18% GST): ₹" + shippingBase.toFixed(2));
    console.log("Shipping GST Component (18%): ₹" + shippingGST.toFixed(2));

    console.log("\n-- Final Display --");
    console.log("CGST: ₹" + totalCGST.toFixed(2));
    console.log("SGST: ₹" + totalSGST.toFixed(2));

    // Verification: Base + Tax = Total
    const totalBase = productBaseTotal + shippingBase;
    const totalTax = totalCGST + totalSGST;

    console.log("\n-- Math Verification --");
    console.log("Total Base + Total Tax: ₹" + (totalBase + totalTax).toFixed(2));
    console.log("Expected Grand Total:   ₹" + finalTotal.toFixed(2));

    if (Math.abs((totalBase + totalTax) - finalTotal) < 0.01) {
        console.log("✅ Math checks out! Base + Tax exactly equals the Grand Total.");
    } else {
        console.log("❌ ERROR: Math mismatch!");
    }
};

testCartCalculations();

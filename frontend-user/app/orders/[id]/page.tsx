export const runtime = 'edge';
import OrderClientWrapper from "./OrderClientWrapper";

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
    return <OrderClientWrapper params={params} />;
}

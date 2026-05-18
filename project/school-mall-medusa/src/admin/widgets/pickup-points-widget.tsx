import { Container, Heading, Table, Text } from "@medusajs/ui";
import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { useState, useEffect } from "react";

/**
 * Admin widget: Display pickup points in order detail page
 */
const PickupPointsWidget = ({ data }: { data: { id: string } }) => {
  const [pickupPoints, setPickupPoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch pickup points from API
    fetch(`/admin/pickup-points`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setPickupPoints(data.pickup_points || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <Container>Loading pickup points...</Container>;
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">自提点信息</Heading>
      </div>
      <div className="px-6 py-4">
        {pickupPoints.length === 0 ? (
          <Text>暂无自提点数据</Text>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>名称</Table.HeaderCell>
                <Table.HeaderCell>地址</Table.HeaderCell>
                <Table.HeaderCell>营业时间</Table.HeaderCell>
                <Table.HeaderCell>联系电话</Table.HeaderCell>
                <Table.HeaderCell>状态</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {pickupPoints.map((point: any) => (
                <Table.Row key={point.id}>
                  <Table.Cell>{point.name}</Table.Cell>
                  <Table.Cell>{point.address}</Table.Cell>
                  <Table.Cell>{point.business_hours}</Table.Cell>
                  <Table.Cell>{point.contact_phone}</Table.Cell>
                  <Table.Cell>
                    {point.is_enabled ? "启用" : "禁用"}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "order.details.side.before",
});

export default PickupPointsWidget;

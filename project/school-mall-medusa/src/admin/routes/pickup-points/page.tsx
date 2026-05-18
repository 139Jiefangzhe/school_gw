import { defineRouteConfig } from "@medusajs/admin-sdk";
import {
  Container,
  Heading,
  Button,
  Table,
  Badge,
  Toaster,
  toast,
} from "@medusajs/ui";
import { Plus, Pencil, Trash } from "@medusajs/icons";
import { useState, useEffect } from "react";

/**
 * Admin Route: Pickup Points Management
 * CRUD interface for managing self-pickup locations
 */
const PickupPointsPage = () => {
  const [pickupPoints, setPickupPoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPickupPoints = async () => {
    try {
      const res = await fetch(`/admin/pickup-points`, {
        credentials: "include",
      });
      const data = await res.json();
      setPickupPoints(data.pickup_points || []);
    } catch (error) {
      toast.error("Failed to fetch pickup points");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickupPoints();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this pickup point?")) return;

    try {
      const res = await fetch(`/admin/pickup-points/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Pickup point deleted");
        fetchPickupPoints();
      } else {
        toast.error("Failed to delete pickup point");
      }
    } catch {
      toast.error("An error occurred");
    }
  };

  return (
    <Container>
      <div className="flex items-center justify-between mb-4">
        <Heading level="h1">自提点管理</Heading>
        <Button variant="primary" onClick={() => {}}>
          <Plus /> 添加自提点
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>名称</Table.HeaderCell>
              <Table.HeaderCell>地址</Table.HeaderCell>
              <Table.HeaderCell>营业时间</Table.HeaderCell>
              <Table.HeaderCell>联系电话</Table.HeaderCell>
              <Table.HeaderCell>状态</Table.HeaderCell>
              <Table.HeaderCell className="text-right">操作</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {pickupPoints.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={6} className="text-center py-8">
                  暂无自提点数据
                </Table.Cell>
              </Table.Row>
            ) : (
              pickupPoints.map((point) => (
                <Table.Row key={point.id}>
                  <Table.Cell className="font-medium">{point.name}</Table.Cell>
                  <Table.Cell>{point.address}</Table.Cell>
                  <Table.Cell>{point.business_hours}</Table.Cell>
                  <Table.Cell>{point.contact_phone}</Table.Cell>
                  <Table.Cell>
                    <Badge color={point.is_enabled ? "green" : "grey"}>
                      {point.is_enabled ? "启用" : "禁用"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="secondary" size="small">
                        <Pencil />
                      </Button>
                      <Button
                        variant="danger"
                        size="small"
                        onClick={() => handleDelete(point.id)}
                      >
                        <Trash />
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      )}
      <Toaster />
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "自提点管理",
  icon: "MapPin",
});

export default PickupPointsPage;

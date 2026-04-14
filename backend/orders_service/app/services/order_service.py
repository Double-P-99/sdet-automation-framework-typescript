import logging
import math
import uuid
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.order import Order, OrderItem, OrderStatus, ORDER_STATUS_TRANSITIONS
from app.schemas.order import CreateOrderRequest, UpdateOrderStatusRequest

logger = logging.getLogger(__name__)


class OrderService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create_order(self, user_id: str, data: CreateOrderRequest) -> Order:
        total = sum(
            Decimal(str(item.unit_price)) * item.quantity for item in data.items
        )
        order = Order(
            user_id=uuid.UUID(user_id),
            total_amount=float(total),
            currency=data.currency,
            notes=data.notes,
            status=OrderStatus.PENDING,
        )
        self.db.add(order)
        self.db.flush()  # Get the order ID before committing

        for item in data.items:
            subtotal = float(Decimal(str(item.unit_price)) * item.quantity)
            order_item = OrderItem(
                order_id=order.id,
                product_id=item.product_id,
                product_name=item.product_name,
                quantity=item.quantity,
                unit_price=float(item.unit_price),
                subtotal=subtotal,
            )
            self.db.add(order_item)

        self.db.commit()
        self.db.refresh(order)
        logger.info(
            "Created order %s for user %s — total=%.2f %s",
            order.id,
            user_id,
            order.total_amount,
            order.currency,
        )
        return order

    def get_order(self, order_id: str, user_id: str, role: str) -> Order:
        order = self.db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
        if role != "admin" and str(order.user_id) != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        return order

    def list_orders(
        self,
        user_id: str,
        role: str,
        page: int = 1,
        page_size: int = 20,
        filter_status: str | None = None,
    ) -> tuple[list[Order], int]:
        query = self.db.query(Order)
        if role != "admin":
            query = query.filter(Order.user_id == user_id)
        if filter_status:
            query = query.filter(Order.status == filter_status)
        total = query.count()
        orders = (
            query.order_by(Order.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )
        return orders, total

    def update_status(
        self, order_id: str, data: UpdateOrderStatusRequest, user_id: str, role: str
    ) -> Order:
        order = self.get_order(order_id, user_id, role)

        allowed = ORDER_STATUS_TRANSITIONS.get(order.status, [])
        if data.status not in allowed:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=(
                    f"Cannot transition from {order.status.value} to {data.status.value}. "
                    f"Allowed: {[s.value for s in allowed]}"
                ),
            )

        # Only admins can confirm/ship/deliver; owners can only cancel
        if data.status != OrderStatus.CANCELLED and role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admins can advance order status",
            )

        order.status = data.status
        self.db.commit()
        self.db.refresh(order)
        logger.info("Order %s transitioned to %s by user %s", order_id, data.status, user_id)
        return order

    def cancel_order(self, order_id: str, user_id: str, role: str) -> None:
        order = self.get_order(order_id, user_id, role)
        if order.status not in (OrderStatus.PENDING, OrderStatus.CONFIRMED):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Cannot cancel an order with status {order.status.value}",
            )
        order.status = OrderStatus.CANCELLED
        self.db.commit()
        logger.info("Order %s cancelled by user %s", order_id, user_id)

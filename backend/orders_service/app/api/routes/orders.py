import math
from dataclasses import dataclass

from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.orm import Session

from app.api.deps import TokenPayload, get_current_user_payload, get_db
from app.schemas.order import (
    CreateOrderRequest,
    OrderResponse,
    PaginatedOrdersResponse,
    UpdateOrderStatusRequest,
)
from app.services.order_service import OrderService

router = APIRouter()


@router.post(
    "/",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new order",
)
async def create_order(
    body: CreateOrderRequest,
    db: Session = Depends(get_db),
    current_user: TokenPayload = Depends(get_current_user_payload),
) -> OrderResponse:
    service = OrderService(db)
    order = service.create_order(user_id=current_user.user_id, data=body)
    return OrderResponse.model_validate(order)


@router.get(
    "/",
    response_model=PaginatedOrdersResponse,
    summary="List orders (all for admins, own for customers)",
)
async def list_orders(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    status_filter: str | None = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
    current_user: TokenPayload = Depends(get_current_user_payload),
) -> PaginatedOrdersResponse:
    service = OrderService(db)
    orders, total = service.list_orders(
        user_id=current_user.user_id,
        role=current_user.role,
        page=page,
        page_size=page_size,
        filter_status=status_filter,
    )
    return PaginatedOrdersResponse(
        items=[OrderResponse.model_validate(o) for o in orders],
        total=total,
        page=page,
        page_size=page_size,
        pages=math.ceil(total / page_size) if total > 0 else 0,
    )


@router.get(
    "/{order_id}",
    response_model=OrderResponse,
    summary="Get a single order by ID",
)
async def get_order(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: TokenPayload = Depends(get_current_user_payload),
) -> OrderResponse:
    service = OrderService(db)
    order = service.get_order(
        order_id=order_id, user_id=current_user.user_id, role=current_user.role
    )
    return OrderResponse.model_validate(order)


@router.patch(
    "/{order_id}/status",
    response_model=OrderResponse,
    summary="Advance or cancel an order's status",
)
async def update_order_status(
    order_id: str,
    body: UpdateOrderStatusRequest,
    db: Session = Depends(get_db),
    current_user: TokenPayload = Depends(get_current_user_payload),
) -> OrderResponse:
    service = OrderService(db)
    order = service.update_status(
        order_id=order_id,
        data=body,
        user_id=current_user.user_id,
        role=current_user.role,
    )
    return OrderResponse.model_validate(order)


@router.delete(
    "/{order_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Cancel an order (customer or admin)",
)
async def cancel_order(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: TokenPayload = Depends(get_current_user_payload),
) -> None:
    service = OrderService(db)
    service.cancel_order(
        order_id=order_id, user_id=current_user.user_id, role=current_user.role
    )

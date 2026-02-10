...existing code...

router = APIRouter(tags=["health"])


@router.get("/health")
def health():
    return {"ok": True}

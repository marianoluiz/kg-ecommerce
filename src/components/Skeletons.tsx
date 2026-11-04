// Placeholder shapes shown while server data loads. Purely visual; hidden from screen readers.

function Bar({ w = "100%", h = "0.8rem", style }: { w?: string; h?: string; style?: React.CSSProperties }) {
  return <span className="skeleton" style={{ width: w, height: h, ...style }} />;
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="product-grid" aria-busy="true" aria-label="Loading products">
      {Array.from({ length: count }, (_, i) => (
        <div className="product-card" key={i} aria-hidden="true">
          <div className="product-image-container skeleton" />
          <div className="product-info">
            <Bar w="55%" h="0.7rem" />
            <Bar w="20%" h="0.7rem" />
          </div>
        </div>
      ))}
    </div>
  );
}

function HeaderSkeleton() {
  return (
    <div className="checkout-header" aria-hidden="true">
      <Bar w="14rem" h="2rem" />
      <Bar w="20rem" h="0.8rem" style={{ marginTop: "1rem" }} />
    </div>
  );
}


export function AccountSkeleton() {
  return (
    <section className="checkout-section" aria-busy="true" aria-label="Loading account">
      <div className="account-container">
        <HeaderSkeleton />
        <Bar w="9rem" h="0.8rem" style={{ marginBottom: "2rem" }} />
        <div className="order-list" aria-hidden="true">
          {Array.from({ length: 4 }, (_, i) => (
            <div className="order-row" key={i}>
              <div>
                <Bar w="6rem" />
                <Bar w="4.5rem" h="0.65rem" style={{ marginTop: "0.5rem" }} />
              </div>
              <Bar w="70%" />
              <Bar w="4rem" />
              <Bar w="5rem" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function OrderSkeleton() {
  return (
    <section className="checkout-section" aria-busy="true" aria-label="Loading order">
      <div className="checkout-container" aria-hidden="true">
        <div>
          <HeaderSkeleton />
          <div className="skeleton-stack">
            <Bar w="40%" />
            <Bar w="55%" />
            <Bar w="80%" />
            <Bar w="45%" />
          </div>
        </div>
        <div className="skeleton-stack">
          <Bar w="50%" h="1.2rem" />
          <Bar h="1rem" />
          <Bar h="1rem" />
          <Bar h="1.4rem" style={{ marginTop: "1rem" }} />
        </div>
      </div>
    </section>
  );
}

export function AdminSkeleton() {
  return (
    <section className="checkout-section" aria-busy="true" aria-label="Loading admin">
      <div className="admin-container" aria-hidden="true">
        <HeaderSkeleton />
        {Array.from({ length: 3 }, (_, i) => (
          <div className="admin-card" key={i}>
            <div className="skeleton-stack">
              <Bar w="35%" />
              <Bar h="3.5rem" />
              <Bar w="25%" h="2rem" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function LoginSkeleton() {
  return (
    <section className="login-page" aria-busy="true" aria-label="Loading">
      <div className="login-box skeleton-stack" aria-hidden="true">
        <Bar w="60%" h="1rem" style={{ margin: "0 auto 2rem" }} />
        <Bar w="30%" h="1.6rem" />
        <Bar h="3rem" />
        <Bar h="3rem" />
        <Bar h="3rem" />
      </div>
    </section>
  );
}

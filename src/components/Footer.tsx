"use client";

import Link from "next/link";
import { useState } from "react";
import { Modal } from "./Modal";

type ModalId = "legal" | "privacy" | null;

export function Footer() {
  const [openModal, setOpenModal] = useState<ModalId>(null);
  const close = () => setOpenModal(null);

  return (
    <>
      <footer className="site-footer">
        <div className="footer-top">
          <div className="footer-col">
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Insert your e-mail address *" aria-label="Email address" />
              <button type="submit" aria-label="Subscribe">→</button>
            </form>
            <div className="social-icons">
              {["f", "𝕏", "ig", "yt", "sp", "dc", "tk"].map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><Link href="/#about">About Group 5</Link></li>
              <li><a href="#">The Kallos Gorgon Ethos</a></li>
              <li><a href="#">Quadros Technology™</a></li>
              <li><a href="#">Sustainability</a></li>
              <li><a href="#">Careers</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Legal Terms and Conditions</h4>
            <ul>
              <li><button type="button" onClick={() => setOpenModal("legal")}>E-Commerce Act (R.A. 8792)</button></li>
              <li><button type="button" onClick={() => setOpenModal("legal")}>Consumer Protection (R.A. 7394)</button></li>
              <li><button type="button" onClick={() => setOpenModal("privacy")}>Cyber Security &amp; Privacy</button></li>
              <li><a href="#">Cookie Policy</a></li>
              <li><a href="#">Sitemap</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copy">© 2026 KALLOS GORGON. GROUP 5 CISTM CAPSTONE.</div>
          <div className="footer-utils">
            <span>📍 STORE LOCATOR</span>
            <span>🌐 LOCATION: MANILA, PHILIPPINES / ENGLISH</span>
          </div>
        </div>
      </footer>

      <Modal open={openModal === "legal"} title="E-Commerce & Consumer Law" onClose={close}>
        <p><strong>Electronic Documents (R.A. 8792)</strong>: By proceeding with transactions on Kallos Gorgon, you acknowledge that electronic documents and digital inputs hold functional legal equivalence to paper-based contracts under the Philippine Electronic Commerce Act of 2000.</p>
        <p><strong>Consumer Protection (R.A. 7394)</strong>: Our digital storefront strictly adheres to the mandates of the Consumer Act of the Philippines, ensuring transparency in pricing, accurate product descriptions, and structured return protocols.</p>
      </Modal>

      <Modal open={openModal === "privacy"} title="Cyber Security & Confidentiality" onClose={close}>
        <p><strong>Service Provider Boundaries (Section 30, R.A. 8792)</strong>: Kallos Gorgon maintains strict confidentiality regarding authorized access to data messages, operating within statutory bounds regarding third-party transmission liability.</p>
        <p><strong>Cyber Penalties (Section 33, R.A. 8792)</strong>: Unauthorized access, data alteration, hacking, and piracy against this platform&apos;s network architecture are explicitly criminalized and subject to statutory fines (minimum P100,000) and mandatory imprisonment.</p>
      </Modal>
    </>
  );
}

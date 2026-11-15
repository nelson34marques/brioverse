import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import Container from "../components/layout/Container.jsx";
import Button from "../components/ui/Button.jsx";
import Chip from "../components/ui/Chip.jsx";
import { StatusBadge, VerifiedBadge } from "../components/ui/StatusBadge.jsx";
import { useT } from "../hooks/useT.js";
import { useAuth } from "../hooks/useAuth.js";
import { usePrefs } from "../hooks/usePrefs.js";
import VerifyEmailNotice from "../components/auth/VerifyEmailNotice.jsx";
import { useDeveloper } from "../hooks/useDeveloper.js";
import { useInstallApp } from "../hooks/useInstallApp.js";
import { InstallGuideModal } from "../components/layout/InstallBanner.jsx";
import { logout } from "../lib/auth.js";
import { DEVICES } from "../lib/device.js";
import { SITE } from "../config/site.js";
import styles from "./Account.module.css";

function Chevron() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

/** Botão do cartão "Desenvolvedor", conforme o estado da candidatura. */
function DevButton({ developer }) {
  const { t } = useT();
  if (!developer) {
    return (
      <Button variant="cta" size="sm" to="/dev/candidatura">
        {t("account.dev_apply")}
      </Button>
    );
  }
  if (developer.status === "approved") {
    return (
      <Button variant="cta" size="sm" to="/dev">
        {t("account.dev_mode")}
      </Button>
    );
  }
  if (developer.status === "revoked") return null;
  return (
    <Button variant="secondary" size="sm" to="/dev/candidatura">
      {t(developer.status === "rejected" ? "account.dev_resubmit" : "account.dev_view")}
    </Button>
  );
}

DevButton.propTypes = {
  developer: PropTypes.object,
};

/** Conta: perfil, preferências, desenvolvedor, (admin), instalar a app, legal e sessão. Mesmo desenho em PC e telemóvel. */
export default function Account() {
  const { t } = useT();
  const { profile, user, role } = useAuth();
  const { developer } = useDeveloper();
  const { prefs, devices, openOnboarding, setDevices } = usePrefs();

  /** Liga/desliga uma plataforma; nunca deixa ficar sem nenhuma (o detectado fica sempre). */
  const toggleDevice = (key) => {
    if (devices.includes(key)) {
      if (devices.length === 1) return;
      setDevices(devices.filter((d) => d !== key));
    } else {
      setDevices([...devices, key]);
    }
  };
  const installApp = useInstallApp();

  const name = profile?.name || user?.displayName || "";
  const email = user?.email || "";
  const photo = profile?.avatarUrl || user?.photoURL || "";
  const initial = (name || email || "?").charAt(0).toUpperCase();

  /** "Android, Computador" ou "Jogos, Educação, Produtividade +3". */
  const summary = (keys, label, max) => {
    if (!keys.length) return t("account.none");
    const names = keys.slice(0, max).map((k) => t(label(k)));
    const rest = keys.length - names.length;
    return rest > 0 ? `${names.join(", ")} +${rest}` : names.join(", ");
  };

  return (
    <Container className={styles.page}>
      <header className={styles.profile}>
        {photo ? (
          <img
            className={styles.avatar}
            src={photo}
            alt=""
            referrerPolicy="no-referrer"
          />
        ) : (
          <span
            className={`${styles.avatar} ${styles.avatarFallback}`}
            aria-hidden="true"
          >
            {initial}
          </span>
        )}
        <div className={styles.who}>
          <h1 className={styles.name}>{name || t("nav.account")}</h1>
          <p className={styles.email}>{email}</p>
        </div>
      </header>

      <VerifyEmailNotice />

      <section className={styles.card}>
        <div className={styles.cardHead}>
          <h2 className={styles.h2}>{t("account.prefs")}</h2>
          <Button variant="secondary" size="sm" onClick={openOnboarding}>
            {t("account.edit_prefs")}
          </Button>
        </div>
        <p className={styles.hint}>{t("account.prefs_hint")}</p>
        <div className={styles.row}>
          <span className={styles.label}>{t("account.platforms")}</span>
          <div className={styles.chips} role="group" aria-label={t("account.platforms")}>
            {DEVICES.map((d) => (
              <Chip key={d} outline active={devices.includes(d)} onClick={() => toggleDevice(d)}>
                {t(`onboarding.${d}`)}
              </Chip>
            ))}
          </div>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>{t("account.interests")}</span>
          <p className={styles.hint}>
            {prefs.interests.length
              ? summary(prefs.interests, (k) => `categories.${k}`, 4)
              : t("account.none")}
          </p>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.cardHead}>
          <h2 className={styles.h2}>
            {t("account.dev")}
            {developer && (
              <span className={styles.badges}>
                <StatusBadge status={developer.status} />
                {developer.verified && <VerifiedBadge />}
              </span>
            )}
          </h2>
          <DevButton developer={developer} />
        </div>
        <p className={styles.hint}>
          {!developer && t("account.dev_intro")}
          {developer?.status === "pending" && t("account.dev_pending")}
          {developer?.status === "approved" && t("account.dev_active")}
          {developer?.status === "rejected" && (
            <>
              {t("account.dev_rejected")} {developer.note && <strong>{developer.note}</strong>}
            </>
          )}
          {developer?.status === "revoked" && (
            <>
              {t("account.dev_revoked")} {developer.note && <strong>{developer.note}</strong>}
            </>
          )}
        </p>
      </section>

      {role === "admin" && (
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <h2 className={styles.h2}>{t("account.admin")}</h2>
            <Button variant="cta" size="sm" to="/admin">
              {t("account.admin_panel")}
            </Button>
          </div>
          <p className={styles.hint}>{t("account.admin_hint")}</p>
        </section>
      )}

      {installApp.status !== "no" && (
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <h2 className={styles.h2}>{t("pwa.account_label")}</h2>
            {installApp.status !== "installed" && (
              <Button variant="secondary" size="sm" onClick={installApp.install}>
                {t("pwa.install_full")}
              </Button>
            )}
          </div>
          <p className={styles.hint}>
            {installApp.status === "installed"
              ? t("pwa.installed")
              : t("pwa.subtitle", { host: window.location.host })}
          </p>
        </section>
      )}
      <InstallGuideModal
        open={installApp.guideOpen}
        onClose={installApp.closeGuide}
        device={installApp.device}
      />

      <section className={styles.card}>
        <h2 className={styles.h2}>{t("account.legal")}</h2>
        <ul className={styles.links}>
          <li>
            <Link to="/termos" className={styles.link}>
              <span>{t("legal.terms_title")}</span>
              <Chevron />
            </Link>
          </li>
          <li>
            <Link to="/privacidade" className={styles.link}>
              <span>{t("legal.privacy_title")}</span>
              <Chevron />
            </Link>
          </li>
          <li>
            <a href={`mailto:${SITE.supportEmail}`} className={styles.link}>
              <span>{t("account.support")}</span>
              <Chevron />
            </a>
          </li>
        </ul>
      </section>

      <section className={styles.card}>
        <h2 className={styles.h2}>{t("account.session")}</h2>
        <div className={styles.cardHead}>
          <p className={styles.hint}>{t("account.session_hint")}</p>
          <Button variant="secondary" size="sm" onClick={() => logout()}>
            {t("nav.logout")}
          </Button>
        </div>
      </section>
    </Container>
  );
}

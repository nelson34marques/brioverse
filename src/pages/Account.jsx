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
import { useTheme } from "../hooks/useTheme.js";
import { logout } from "../lib/auth.js";
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

/** Conta: perfil, preferências, desenvolvedor, aparência, legal e sessão. Mesmo desenho em PC e telemóvel. */
export default function Account() {
  const { t, lang, setLang } = useT();
  const { profile, user, role } = useAuth();
  const { developer } = useDeveloper();
  const { prefs, openOnboarding } = usePrefs();
  const { theme, setTheme } = useTheme();

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
        <p className={styles.hint}>
          {prefs.devices.length || prefs.interests.length ? (
            <>
              <strong>{summary(prefs.devices, (k) => `onboarding.${k}`, 2)}</strong>
              {" · "}
              {summary(prefs.interests, (k) => `categories.${k}`, 3)}
            </>
          ) : (
            t("account.prefs_empty")
          )}
        </p>
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

      <section className={styles.card}>
        <h2 className={styles.h2}>{t("account.appearance")}</h2>
        <div className={styles.row}>
          <span className={styles.label}>{t("account.theme")}</span>
          <div
            className={styles.chips}
            role="radiogroup"
            aria-label={t("account.theme")}
          >
            <Chip
              outline
              active={theme === "light"}
              onClick={() => setTheme("light")}
            >
              {t("theme.light")}
            </Chip>
            <Chip
              outline
              active={theme === "dark"}
              onClick={() => setTheme("dark")}
            >
              {t("theme.dark")}
            </Chip>
          </div>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>{t("account.language")}</span>
          <div
            className={styles.chips}
            role="radiogroup"
            aria-label={t("account.language")}
          >
            <Chip outline active={lang === "pt"} onClick={() => setLang("pt")}>
              {t("lang.pt")}
            </Chip>
            <Chip outline active={lang === "en"} onClick={() => setLang("en")}>
              {t("lang.en")}
            </Chip>
          </div>
        </div>
      </section>

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

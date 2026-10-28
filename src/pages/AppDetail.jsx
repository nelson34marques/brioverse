import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Container from "../components/layout/Container.jsx";
import Button from "../components/ui/Button.jsx";
import Badge from "../components/ui/Badge.jsx";
import VerifiedIcon from "../components/ui/VerifiedIcon.jsx";
import AppIcon from "../components/app/AppIcon.jsx";
import ActionButton from "../components/app/ActionButton.jsx";
import AppGallery from "../components/app/AppGallery.jsx";
import AppRow from "../components/app/AppRow.jsx";
import Reviews from "../components/app/Reviews.jsx";
import { Star } from "../components/app/Rating.jsx";
import { useT } from "../hooks/useT.js";
import { useApp, useApps } from "../hooks/useApps.js";
import { useReviews } from "../hooks/useReviews.js";
import { useLibrary } from "../hooks/useLibrary.js";
import { trackView } from "../lib/stats.js";
import { compactNumber, rating1, sizeMb, shortDate } from "../utils/format.js";
import { categoryByKey } from "../utils/categories.js";
import styles from "./AppDetail.module.css";

export default function AppDetail() {
  const { t, lang } = useT();
  const { appId } = useParams();
  const { app, loading, notFound } = useApp(appId);
  const reviewsState = useReviews(app);
  const { entry: libraryEntry } = useLibrary();
  const libEntry = app ? libraryEntry(app.id) : null;
  const hasUpdate = Boolean(libEntry && libEntry.seenCode < app.versionCode);
  const whatsNew = app ? app.changelog || app.releases?.[0]?.notes || "" : "";
  const { summary: ratingSummary } = reviewsState;

  useEffect(() => {
    if (app?.id) trackView(app.id);
  }, [app?.id]);
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const { apps: similar } = useApps({
    category: app?.category,
    exclude: app?.id,
    sort: "rating",
    limit: 10,
  });
  const { apps: fromDev } = useApps({ exclude: app?.id, sort: "recent" });
  const moreFromDev = app
    ? fromDev.filter((a) => a.developerId === app.developerId).slice(0, 10)
    : [];

  if (loading) {
    return (
      <Container className={styles.page}>
        <div className={styles.skelHead}>
          <div className={styles.skelIcon} />
          <div className={styles.skelLines}>
            <div />
            <div />
            <div />
          </div>
        </div>
      </Container>
    );
  }

  if (notFound || !app) {
    return (
      <Container
        className={styles.page}
        style={{ textAlign: "center", paddingBlock: "var(--space-12)" }}
      >
        <h1>{t("not_found.title")}</h1>
        <p
          className="muted"
          style={{ marginBlock: "var(--space-3) var(--space-6)" }}
        >
          {t("app_detail.not_found")}
        </p>
        <Button to="/">{t("not_found.back_home")}</Button>
      </Container>
    );
  }

  const cat = categoryByKey(app.category);
  const isApk = app.type === "apk";
  const desc = app.fullDescription || app.shortDescription || "";
  const long = desc.length > 280;
  const shown = expanded || !long ? desc : `${desc.slice(0, 280).trimEnd()}…`;

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: app.title,
          text: app.shortDescription,
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* cancelado */
    }
  }

  return (
    <Container className={styles.page}>
      <header className={styles.head}>
        <AppIcon app={app} size={96} className={styles.icon} />
        <div className={styles.headText}>
          <h1 className={styles.title}>{app.title}</h1>
          <p className={styles.dev}>
            <Link
              to={`/pesquisa?q=${encodeURIComponent(app.developerName || "")}`}
            >
              {app.developerName}
            </Link>
            {app.verified && (
              <span
                className={styles.verified}
                title={t("app_detail.verified")}
              >
                <VerifiedIcon />
                {t("app_detail.verified")}
              </span>
            )}
          </p>
          <p className={styles.tags}>
            <Badge tone="brand">{isApk ? "APK" : t("search.pwa_short")}</Badge>
            {cat && (
              <Link to={`/categoria/${cat.slug}`}>
                <Badge>{t(`categories.${cat.key}`)}</Badge>
              </Link>
            )}
            {libEntry && (
              <Badge tone={hasUpdate ? "warning" : "success"}>
                {t(hasUpdate ? "updates.available" : "updates.in_library")}
              </Badge>
            )}
          </p>
        </div>
      </header>

      <ul className={styles.stats}>
        <li>
          <span className={styles.statValue}>
            {ratingSummary.count ? rating1(ratingSummary.avg) : "–"}
            <Star size={12} />
          </span>
          <span className={styles.statLabel}>
            {ratingSummary.count
              ? `${compactNumber(ratingSummary.count, lang)} ${t(ratingSummary.count === 1 ? "app_detail.rating_one" : "app_detail.ratings")}`
              : t("reviews.no_ratings")}
          </span>
        </li>
        <li>
          <span className={styles.statValue}>
            {compactNumber(app.stats.views, lang)}
          </span>
          <span className={styles.statLabel}>{t("app_detail.views")}</span>
        </li>
        {isApk ? (
          <li>
            <span className={styles.statValue}>
              {sizeMb(app.apkSizeMb) ?? "–"}
            </span>
            <span className={styles.statLabel}>{t("app_detail.size")}</span>
          </li>
        ) : (
          <li>
            <span className={styles.statValue}>{t("search.pwa_short")}</span>
            <span className={styles.statLabel}>{t("home.pwa_row")}</span>
          </li>
        )}
      </ul>

      <div className={styles.actions}>
        <ActionButton app={app} />
        <button
          type="button"
          onClick={share}
          className={styles.shareIcon}
          aria-label={t("app_detail.share")}
          title={t("app_detail.share")}
        >
          {copied ? (
            <span className={styles.copied}>{t("app_detail.copied")}</span>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 3v12M8 7l4-4 4 4M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
            </svg>
          )}
        </button>
      </div>

      {app.screenshots?.length > 0 && (
        <section className={`${styles.section} ${styles.gallery}`}>
          <h2 className={styles.h2}>{t("app_detail.screenshots")}</h2>
          <AppGallery screenshots={app.screenshots} title={app.title} />
        </section>
      )}

      <section className={styles.section}>
        <h2 className={styles.h2}>{t("app_detail.about")}</h2>
        <p className={styles.short}>{app.shortDescription}</p>
        <p className={styles.desc}>{shown}</p>
        {long && (
          <button
            type="button"
            className={styles.more}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? t("app_detail.less") : t("app_detail.more")}
          </button>
        )}
      </section>

      {whatsNew && (
        <section className={styles.section}>
          <h2 className={styles.h2}>{t("updates.whats_new")}</h2>
          <p className={styles.whatsMeta}>
            {t("updates.version_date", { v: app.version, date: shortDate(app.releasedAt || app.updatedAt, lang) })}
          </p>
          <p className={styles.desc}>{whatsNew}</p>
        </section>
      )}

      <section className={styles.section}>
        <h2 className={styles.h2}>{t("app_detail.info")}</h2>
        <dl className={styles.info}>
          <div>
            <dt>{t("app_detail.type")}</dt>
            <dd>{isApk ? t("search.apk") : t("search.pwa")}</dd>
          </div>
          <div>
            <dt>{t("app_detail.version")}</dt>
            <dd>
              {app.version}
              {hasUpdate && ` · ${t("updates.you_have", { v: libEntry.version })}`}
            </dd>
          </div>
          {app.updatedAt > 0 && (
            <div>
              <dt>{t("app_detail.updated")}</dt>
              <dd>{shortDate(app.updatedAt, lang)}</dd>
            </div>
          )}
          {cat && (
            <div>
              <dt>{t("app_detail.category")}</dt>
              <dd>{t(`categories.${cat.key}`)}</dd>
            </div>
          )}
          <div>
            <dt>{t("app_detail.developer")}</dt>
            <dd>{app.developerName}</dd>
          </div>
        </dl>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>{t("app_detail.reviews")}</h2>
        <Reviews app={app} state={reviewsState} />
      </section>

        {moreFromDev.length > 0 && (
        <AppRow
          title={t("app_detail.more_from", { dev: app.developerName })}
          apps={moreFromDev}
        />
      )}
      {similar.length > 0 && cat && (
        <AppRow
          title={t("app_detail.similar")}
          to={`/categoria/${cat.slug}`}
          apps={similar}
        />
      )}
    </Container>
  );
}

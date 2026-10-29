import { useSearchParams } from "react-router-dom";
import Container from "../components/layout/Container.jsx";
import CategoryChips from "../components/app/CategoryChips.jsx";
import AppListItem from "../components/app/AppListItem.jsx";
import Chip from "../components/ui/Chip.jsx";
import SortSelect from "../components/ui/SortSelect.jsx";
import ListEnd from "../components/app/ListEnd.jsx";
import { useT } from "../hooks/useT.js";
import { useApps } from "../hooks/useApps.js";
import styles from "./Browse.module.css";

const SORTS = ["trending", "rating", "recent"];

/**
 * Apps: catálogo completo. Categorias em cima (links), tipo e ordem como chips.
 * Chegas aqui por "Apps" no menu ou por "Ver tudo" na home.
 */
export default function Apps() {
  const { t } = useT();
  const [params, setParams] = useSearchParams();
  const type = params.get("tipo") ?? "";
  const sort = SORTS.includes(params.get("ordem"))
    ? params.get("ordem")
    : "trending";
  // Jogos têm secção própria (/jogos): aqui ficam de fora
  const { apps, loading, error, retry } = useApps({ type, sort, excludeCategory: 'games' });

  function set(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  }

  return (
    <Container className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t("nav.apps")}</h1>
        {!loading && (
          <span className={styles.count}>
            {t("category.count", { n: apps.length })}
          </span>
        )}
      </header>

      <div className={styles.chips}>
        <CategoryChips prominent={false} exclude={['games']} />
      </div>

      <div className={styles.filtersClip}>
        <div className={styles.filters}>
          <div className={styles.group}>
            <Chip active={!type} onClick={() => set("tipo", "")}>
              {t("search.all")}
            </Chip>
            <Chip active={type === "pwa"} onClick={() => set("tipo", "pwa")}>
              {t("search.pwa")}
            </Chip>
            <Chip active={type === "apk"} onClick={() => set("tipo", "apk")}>
              {t("search.apk")}
            </Chip>
          </div>
          <div className={styles.sort}>
            <SortSelect
              label={t("search.sort")}
              value={sort}
              options={SORTS.map((s) => ({
                value: s,
                label: t(`search.sort_${s}`),
              }))}
              onChange={(v) => set("ordem", v === "trending" ? "" : v)}
            />
          </div>
        </div>
      </div>

      {!loading && apps.length === 0 && (
        <p className={styles.empty}>
          {error ? t("home.offline_text") : t("search.no_results", { q: t("nav.apps") })}
          {error && (
            <>
              {" "}
              <button type="button" className={styles.retry} onClick={retry}>
                {t("home.retry")}
              </button>
            </>
          )}
        </p>
      )}

      <ul className={styles.list}>
        {apps.map((app) => (
          <li key={app.id}>
            <AppListItem app={app} />
          </li>
        ))}
      </ul>
      {!loading && apps.length > 0 && <ListEnd />}
    </Container>
  );
}

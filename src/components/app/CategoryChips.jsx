import PropTypes from 'prop-types'
import HScroll from '../ui/HScroll.jsx'
import Chip from '../ui/Chip.jsx'
import { useT } from '../../hooks/useT.js'
import { CATEGORIES } from '../../utils/categories.js'

/** Fila de chips de categorias (tonais). `activeKey` marca a actual; `allTo` mostra chip "Todos". */
export default function CategoryChips({ activeKey = null, allTo = null, prominent = true, exclude = [] }) {
  const { t } = useT()
  return (
    <HScroll gap="sm" arrows={false}>
      {allTo && (
        <Chip to={allTo} active={!activeKey} prominent={prominent}>
          {t('search.all')}
        </Chip>
      )}
      {CATEGORIES.filter((c) => !exclude.includes(c.key)).map((c) => (
        <Chip key={c.key} to={`/categoria/${c.slug}`} active={activeKey === c.key} prominent={prominent}>
          {t(`categories.${c.key}`)}
        </Chip>
      ))}
    </HScroll>
  )
}

CategoryChips.propTypes = {
  activeKey: PropTypes.string,
  allTo: PropTypes.string,
  prominent: PropTypes.bool,
  exclude: PropTypes.arrayOf(PropTypes.string),
}

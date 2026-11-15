import { lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import RequireRole from './components/RequireRole.jsx'
import DevLayout from './components/dev/DevLayout.jsx'
import RequireDev from './components/dev/RequireDev.jsx'

// Páginas em chunks separados: a primeira visita só descarrega o que precisa.
const Home = lazy(() => import('./pages/Home.jsx'))
const Apps = lazy(() => import('./pages/Apps.jsx'))
const Search = lazy(() => import('./pages/Search.jsx'))
const Category = lazy(() => import('./pages/Category.jsx'))
const Games = lazy(() => import('./pages/Games.jsx'))
const AppDetail = lazy(() => import('./pages/AppDetail.jsx'))
const Creator = lazy(() => import('./pages/Creator.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const Register = lazy(() => import('./pages/Register.jsx'))
const Account = lazy(() => import('./pages/Account.jsx'))
const DevHome = lazy(() => import('./pages/dev/Home.jsx'))
const DevApps = lazy(() => import('./pages/dev/Apps.jsx'))
const DevPublish = lazy(() => import('./pages/dev/Publish.jsx'))
const DevEdit = lazy(() => import('./pages/dev/Edit.jsx'))
const DevAnalytics = lazy(() => import('./pages/dev/Analytics.jsx'))
const DevNotices = lazy(() => import('./pages/dev/Notices.jsx'))
const DevProfile = lazy(() => import('./pages/dev/Profile.jsx'))
const DevApply = lazy(() => import('./pages/dev/Apply.jsx'))
const Moderation = lazy(() => import('./pages/admin/Moderation.jsx'))
const Legal = lazy(() => import('./pages/Legal.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))

/**
 * Mapa de páginas
 *  /              Início (montra)
 *  /apps          Catálogo completo com filtros
 *  /jogos         Jogos (secção própria: destaques, filas, lista)
 *  /categoria/:s  Uma categoria
 *  /pesquisa      Pesquisa por texto
 *  /app/:id       Página do app
 *  /entrar /registar /conta
 *  /termos /privacidade  Páginas legais
 *  /dev/*          Modo desenvolvedor: casca própria (header, bottom nav e canvas próprios), sem a loja à volta.
 *                  /dev início · /dev/apps · /dev/apps/:id (actualizar) · /dev/publicar · /dev/analise · /dev/avisos · /dev/perfil
 *                  /dev/candidatura pedido de conta (autenticado, sem conta aprovada)
 *  /admin          Painel de administração (role admin)
 */
export default function App() {
  return (
    <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="apps" element={<Apps />} />
          <Route path="jogos" element={<Games />} />
          <Route path="categoria/:slug" element={<Category />} />
          <Route path="pesquisa" element={<Search />} />
          <Route path="app/:appId" element={<AppDetail />} />
          <Route path="criador/:uid" element={<Creator />} />
          <Route path="entrar" element={<Login />} />
          <Route path="registar" element={<Register />} />
          <Route path="termos" element={<Legal kind="terms" />} />
          <Route path="privacidade" element={<Legal kind="privacy" />} />

          <Route element={<RequireRole />}>
            <Route path="conta" element={<Account />} />
          </Route>

          <Route element={<RequireRole roles={['admin']} />}>
            <Route path="admin" element={<Moderation />} />
          </Route>

          <Route path="404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>

        <Route path="dev" element={<RequireRole />}>
          <Route element={<DevLayout />}>
            <Route index element={<DevHome />} />
            <Route path="candidatura" element={<DevApply />} />
            <Route element={<RequireDev />}>
              <Route path="apps" element={<DevApps />} />
              <Route path="publicar" element={<DevPublish />} />
              <Route path="apps/:id" element={<DevEdit />} />
              <Route path="analise" element={<DevAnalytics />} />
              <Route path="avisos" element={<DevNotices />} />
              <Route path="perfil" element={<DevProfile />} />
            </Route>
            <Route path="*" element={<Navigate to="/dev" replace />} />
          </Route>
        </Route>
    </Routes>
  )
}

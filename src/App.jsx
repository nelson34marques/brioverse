import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import RequireRole from './components/RequireRole.jsx'
import Home from './pages/Home.jsx'
import Apps from './pages/Apps.jsx'
import Search from './pages/Search.jsx'
import Category from './pages/Category.jsx'
import Games from './pages/Games.jsx'
import AppDetail from './pages/AppDetail.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Account from './pages/Account.jsx'
import DevLayout from './components/dev/DevLayout.jsx'
import DevHome from './pages/dev/Home.jsx'
import DevApps from './pages/dev/Apps.jsx'
import DevPublish from './pages/dev/Publish.jsx'
import DevEdit from './pages/dev/Edit.jsx'
import DevAnalytics from './pages/dev/Analytics.jsx'
import DevNotices from './pages/dev/Notices.jsx'
import DevProfile from './pages/dev/Profile.jsx'
import DevApply from './pages/dev/Apply.jsx'
import RequireDev from './components/dev/RequireDev.jsx'
import Moderation from './pages/admin/Moderation.jsx'
import Legal from './pages/Legal.jsx'
import NotFound from './pages/NotFound.jsx'

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

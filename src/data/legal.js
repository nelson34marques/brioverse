// Texto dos Termos de utilização e da Política de privacidade.
// {name}, {operator} e {email} são preenchidos a partir de src/config/site.js.
// Parágrafos em string; listas em array de strings.

const PT_TERMS = {
  intro:
    'Estes Termos de utilização regulam o acesso e a utilização da {name}, uma montra de aplicações web (PWA), sites e ficheiros APK publicados por criadores independentes. Ao utilizar o serviço aceitas estes termos. Se não concordares, não utilizes o serviço.',
  sections: [
    {
      id: 'servico',
      title: 'O serviço',
      paragraphs: [
        'A {name} é uma plataforma de descoberta. Lista aplicações criadas e distribuídas por terceiros ("criadores"), com descrição, capturas de ecrã, avaliações e ligações para as abrir ou descarregar.',
        'A {name} não desenvolve, aloja nem distribui as aplicações listadas. Os ficheiros APK e as aplicações web são alojados pelos próprios criadores em serviços externos. As ligações apresentadas levam-te para esses serviços.',
        'O serviço é disponibilizado gratuitamente e pode incluir publicidade.',
      ],
    },
    {
      id: 'conta',
      title: 'Conta de utilizador',
      paragraphs: [
        'Podes navegar sem conta. Para avaliar ou comentar aplicações precisas de criar uma conta com email e palavra-passe ou através da tua conta Google.',
        'És responsável por manter as tuas credenciais em segurança e por toda a actividade realizada com a tua conta. Deves ter pelo menos 13 anos para criar uma conta.',
        'Podemos suspender ou encerrar contas que violem estes termos, publiquem conteúdo abusivo ou tentem manipular avaliações e contadores.',
      ],
    },
    {
      id: 'apps-terceiros',
      title: 'Aplicações de terceiros e ficheiros APK',
      paragraphs: [
        'As aplicações listadas são da exclusiva responsabilidade dos seus criadores. A {name} faz uma revisão prévia antes de aprovar uma listagem, mas essa revisão não garante que a aplicação esteja isenta de erros, de código malicioso ou de conteúdo inadequado, nem que respeite a lei aplicável.',
        'A instalação de ficheiros APK fora das lojas oficiais exige que autorizes "fontes desconhecidas" no teu dispositivo. Fazes isso por tua conta e risco. Recomendamos que instales apenas aplicações de criadores em quem confias e que mantenhas o dispositivo protegido.',
        'A {name} não é parte em qualquer relação entre ti e o criador de uma aplicação, incluindo compras, subscrições, suporte ou tratamento dos teus dados dentro dessa aplicação.',
      ],
    },
    {
      id: 'avaliacoes',
      title: 'Avaliações e comentários',
      paragraphs: [
        'Ao publicar uma avaliação concedes à {name} uma licença gratuita, mundial e não exclusiva para a mostrar no serviço. Continuas a ser o autor do conteúdo e podes editá-lo ou eliminá-lo a qualquer momento.',
        'Não é permitido publicar conteúdo que seja:',
        [
          'ofensivo, discriminatório, difamatório ou ameaçador;',
          'publicidade, spam ou ligações para esquemas fraudulentos;',
          'falso ou enganador, incluindo avaliações pagas ou trocadas;',
          'dados pessoais de terceiros ou conteúdo que viole direitos de autor.',
        ],
        'Podemos remover conteúdo que viole estas regras sem aviso prévio.',
      ],
    },
    {
      id: 'criadores',
      title: 'Criadores',
      paragraphs: [
        'Quem publica uma aplicação na {name} declara que tem os direitos necessários sobre ela, que a aplicação não contém código malicioso e que cumpre a lei aplicável, incluindo a legislação de protecção de dados.',
        'O criador é responsável por manter as ligações de download activas, por indicar correctamente a versão e o tamanho dos ficheiros e por prestar suporte aos utilizadores da sua aplicação.',
        'A {name} pode rejeitar, suspender ou remover listagens a qualquer momento, nomeadamente por violação destes termos, denúncias de utilizadores ou razões de segurança.',
      ],
    },
    {
      id: 'propriedade',
      title: 'Propriedade intelectual',
      paragraphs: [
        'A marca {name}, o logótipo, o desenho da interface e o código do serviço pertencem a {operator} ou aos seus licenciantes. Não podes copiá-los, modificá-los ou usá-los sem autorização escrita.',
        'Os nomes, ícones, capturas de ecrã e descrições das aplicações pertencem aos respectivos criadores e são usados apenas para as apresentar no serviço.',
      ],
    },
    {
      id: 'responsabilidade',
      title: 'Limitação de responsabilidade',
      paragraphs: [
        'O serviço é fornecido "tal como está" e "conforme disponível", sem garantias de qualquer tipo, expressas ou implícitas, incluindo garantias de disponibilidade, exactidão ou adequação a um fim específico.',
        'Na medida máxima permitida por lei, {operator} não é responsável por quaisquer danos directos, indirectos, incidentais ou consequentes resultantes da utilização do serviço ou das aplicações nele listadas, incluindo perda de dados, danos no dispositivo ou prejuízos financeiros.',
        'Nada nestes termos exclui responsabilidades que não possam ser excluídas por lei.',
      ],
    },
    {
      id: 'alteracoes',
      title: 'Alterações ao serviço e aos termos',
      paragraphs: [
        'Podemos alterar, suspender ou descontinuar o serviço, no todo ou em parte, a qualquer momento.',
        'Podemos actualizar estes termos. A data da última revisão aparece no topo desta página. Se continuares a utilizar o serviço após uma alteração, aceitas os termos actualizados. Alterações relevantes serão anunciadas no serviço.',
      ],
    },
    {
      id: 'lei',
      title: 'Lei aplicável',
      paragraphs: [
        'Estes termos regem-se pela lei do país onde {operator} está estabelecido. Qualquer litígio será submetido aos tribunais competentes dessa jurisdição, sem prejuízo dos direitos que a lei te confira enquanto consumidor.',
      ],
    },
    {
      id: 'contacto',
      title: 'Contacto',
      paragraphs: ['Para questões sobre estes termos, denúncias de conteúdo ou pedidos de remoção, contacta-nos por email: {email}.'],
    },
  ],
}

const PT_PRIVACY = {
  intro:
    'Esta Política de privacidade explica que dados a {name} recolhe, para que os usa, com quem os partilha e que direitos tens sobre eles. Tratamos os teus dados de forma lícita, transparente e apenas para as finalidades aqui descritas.',
  sections: [
    {
      id: 'responsavel',
      title: 'Responsável pelo tratamento',
      paragraphs: ['O responsável pelo tratamento dos dados é {operator}. Para qualquer questão sobre privacidade, contacta: {email}.'],
    },
    {
      id: 'dados',
      title: 'Dados que recolhemos',
      paragraphs: [
        'Recolhemos apenas o necessário para o serviço funcionar:',
        [
          'Conta: nome, email e, se entrares com Google, a fotografia de perfil fornecida pela Google. Guardados através do Firebase Authentication e na nossa base de dados.',
          'Preferências: dispositivos que usas (Android, iPhone/iPad, computador) e categorias de interesse, escolhidos por ti no primeiro acesso. Guardadas no teu browser e, se tiveres conta, na tua ficha de utilizador.',
          'Avaliações: a nota, o comentário, o teu nome e fotografia de perfil, e a data. São públicos e aparecem na página da aplicação.',
          'Contadores de utilização: número de visualizações e de cliques em "Abrir" ou "Baixar" por aplicação. São agregados e não te identificam.',
          'Dados técnicos: o tipo de dispositivo e de browser, detectados localmente para te mostrar o guia de instalação certo. Não são enviados para os nossos servidores.',
        ],
        'Não recolhemos localização, contactos, ficheiros do dispositivo nem dados de pagamento.',
      ],
    },
    {
      id: 'finalidades',
      title: 'Para que usamos os dados',
      paragraphs: [
        [
          'Criar e gerir a tua conta e manter a sessão iniciada.',
          'Mostrar as tuas avaliações e calcular a nota média de cada aplicação.',
          'Adaptar o guia "Como instalar" e as sugestões do Início aos teus dispositivos e interesses.',
          'Ordenar as aplicações por popularidade com base nos contadores agregados.',
          'Prevenir abusos, como avaliações falsas ou manipulação de contadores.',
          'Cumprir obrigações legais e responder a pedidos das autoridades competentes.',
        ],
        'A base legal é a execução do serviço que pedes ao usar a {name}, o nosso interesse legítimo em mantê-lo seguro e, para as preferências, o teu consentimento, que podes retirar a qualquer momento.',
      ],
    },
    {
      id: 'armazenamento-local',
      title: 'Dados guardados no teu browser',
      paragraphs: [
        'A {name} guarda no teu browser (localStorage e sessionStorage) o tema escolhido, o idioma, as tuas preferências de dispositivos e interesses, e uma marca de quais aplicações já visitaste nesta sessão, para não contar a mesma visualização duas vezes.',
        'Não usamos cookies de rastreio nem de publicidade próprios. Podes apagar estes dados a qualquer momento limpando os dados do site no teu browser.',
      ],
    },
    {
      id: 'partilha',
      title: 'Com quem partilhamos',
      paragraphs: [
        'Não vendemos os teus dados. Partilhamos apenas com:',
        [
          'Google Firebase (Authentication, Firestore e Hosting), que aloja a autenticação, a base de dados e o site. A Google trata estes dados como subcontratante, segundo os seus próprios termos e política de privacidade.',
          'Os criadores e os serviços externos para onde as ligações de "Abrir" ou "Baixar" te levam. A partir desse momento aplica-se a política de privacidade deles, não a nossa.',
          'Autoridades, quando a lei o exigir.',
        ],
        'Os dados podem ser tratados em servidores fora do teu país, nos centros de dados da Google, com as garantias previstas na lei aplicável.',
      ],
    },
    {
      id: 'conservacao',
      title: 'Durante quanto tempo guardamos',
      paragraphs: [
        'Os dados da conta e as avaliações são guardados enquanto a conta existir. Ao eliminar uma avaliação ela é removida de imediato. Ao pedir a eliminação da conta, apagamos a ficha de utilizador e as avaliações associadas num prazo máximo de 30 dias, salvo obrigação legal de conservação.',
        'Os contadores agregados de visualizações e cliques não contêm dados pessoais e são conservados sem prazo.',
      ],
    },
    {
      id: 'direitos',
      title: 'Os teus direitos',
      paragraphs: [
        'Tens o direito de aceder aos teus dados, corrigi-los, pedir a sua eliminação, limitar ou opor-te ao tratamento, e pedir a portabilidade, nos termos da lei aplicável.',
        'Podes editar ou eliminar as tuas avaliações e alterar as preferências directamente na aplicação. Para eliminar a conta ou exercer outro direito, escreve para {email}. Respondemos no prazo máximo de 30 dias.',
        'Se entenderes que os teus direitos não estão a ser respeitados, podes apresentar queixa à autoridade de protecção de dados competente.',
      ],
    },
    {
      id: 'seguranca',
      title: 'Segurança',
      paragraphs: [
        'Usamos ligações cifradas (HTTPS), autenticação gerida pelo Firebase e regras de acesso à base de dados que impedem que um utilizador leia ou altere dados de outro. Nenhum sistema é totalmente seguro; se detectarmos um incidente que afecte os teus dados, informamos-te conforme a lei.',
      ],
    },
    {
      id: 'menores',
      title: 'Menores',
      paragraphs: [
        'O serviço não se destina a menores de 13 anos e não recolhemos conscientemente dados de crianças. Se souberes que um menor criou uma conta, contacta-nos para a eliminarmos.',
      ],
    },
    {
      id: 'alteracoes',
      title: 'Alterações a esta política',
      paragraphs: [
        'Podemos actualizar esta política para reflectir mudanças no serviço ou na lei. A data da última revisão aparece no topo da página. Alterações relevantes serão anunciadas no serviço.',
      ],
    },
  ],
}

const EN_TERMS = {
  intro:
    'These Terms of Use govern access to and use of {name}, a showcase of web apps (PWAs), websites and APK files published by independent creators. By using the service you accept these terms. If you do not agree, do not use the service.',
  sections: [
    {
      id: 'service',
      title: 'The service',
      paragraphs: [
        '{name} is a discovery platform. It lists applications created and distributed by third parties ("creators"), with a description, screenshots, reviews and links to open or download them.',
        '{name} does not develop, host or distribute the listed applications. APK files and web apps are hosted by the creators themselves on external services. The links shown take you to those services.',
        'The service is provided free of charge and may include advertising.',
      ],
    },
    {
      id: 'account',
      title: 'User account',
      paragraphs: [
        'You can browse without an account. To rate or comment on apps you need an account, created with email and password or with your Google account.',
        'You are responsible for keeping your credentials secure and for all activity carried out with your account. You must be at least 13 years old to create an account.',
        'We may suspend or close accounts that breach these terms, post abusive content or try to manipulate ratings and counters.',
      ],
    },
    {
      id: 'third-party-apps',
      title: 'Third-party apps and APK files',
      paragraphs: [
        'Listed apps are the sole responsibility of their creators. {name} reviews listings before approving them, but that review does not guarantee that an app is free of errors, malicious code or inappropriate content, or that it complies with applicable law.',
        'Installing APK files outside official stores requires enabling "unknown sources" on your device. You do so at your own risk. We recommend installing only apps from creators you trust and keeping your device protected.',
        '{name} is not a party to any relationship between you and an app creator, including purchases, subscriptions, support or the handling of your data inside that app.',
      ],
    },
    {
      id: 'reviews',
      title: 'Reviews and comments',
      paragraphs: [
        'By posting a review you grant {name} a free, worldwide, non-exclusive licence to display it in the service. You remain the author and can edit or delete it at any time.',
        'You may not post content that is:',
        [
          'offensive, discriminatory, defamatory or threatening;',
          'advertising, spam or links to fraudulent schemes;',
          'false or misleading, including paid or exchanged reviews;',
          'personal data of others or content that infringes copyright.',
        ],
        'We may remove content that breaches these rules without prior notice.',
      ],
    },
    {
      id: 'creators',
      title: 'Creators',
      paragraphs: [
        'Anyone publishing an app on {name} declares that they hold the necessary rights to it, that the app contains no malicious code and that it complies with applicable law, including data protection legislation.',
        'The creator is responsible for keeping download links active, for correctly stating file version and size, and for supporting the users of their app.',
        '{name} may reject, suspend or remove listings at any time, including for breach of these terms, user reports or security reasons.',
      ],
    },
    {
      id: 'ip',
      title: 'Intellectual property',
      paragraphs: [
        'The {name} brand, logo, interface design and service code belong to {operator} or its licensors. You may not copy, modify or use them without written permission.',
        'App names, icons, screenshots and descriptions belong to their respective creators and are used only to present them in the service.',
      ],
    },
    {
      id: 'liability',
      title: 'Limitation of liability',
      paragraphs: [
        'The service is provided "as is" and "as available", without warranties of any kind, express or implied, including warranties of availability, accuracy or fitness for a particular purpose.',
        'To the maximum extent permitted by law, {operator} is not liable for any direct, indirect, incidental or consequential damages arising from use of the service or of the apps listed in it, including data loss, device damage or financial loss.',
        'Nothing in these terms excludes liability that cannot be excluded by law.',
      ],
    },
    {
      id: 'changes',
      title: 'Changes to the service and to these terms',
      paragraphs: [
        'We may change, suspend or discontinue the service, in whole or in part, at any time.',
        'We may update these terms. The date of the last revision is shown at the top of this page. If you keep using the service after a change, you accept the updated terms. Significant changes will be announced in the service.',
      ],
    },
    {
      id: 'law',
      title: 'Governing law',
      paragraphs: [
        'These terms are governed by the law of the country where {operator} is established. Any dispute will be submitted to the competent courts of that jurisdiction, without prejudice to the rights the law grants you as a consumer.',
      ],
    },
    {
      id: 'contact',
      title: 'Contact',
      paragraphs: ['For questions about these terms, content reports or removal requests, contact us by email: {email}.'],
    },
  ],
}

const EN_PRIVACY = {
  intro:
    'This Privacy Policy explains what data {name} collects, what it is used for, who it is shared with and what rights you have over it. We process your data lawfully, transparently and only for the purposes described here.',
  sections: [
    {
      id: 'controller',
      title: 'Data controller',
      paragraphs: ['The data controller is {operator}. For any privacy question, contact: {email}.'],
    },
    {
      id: 'data',
      title: 'Data we collect',
      paragraphs: [
        'We collect only what the service needs to work:',
        [
          'Account: name, email and, if you sign in with Google, the profile photo provided by Google. Stored through Firebase Authentication and in our database.',
          'Preferences: the devices you use (Android, iPhone/iPad, computer) and categories of interest, chosen by you on first access. Stored in your browser and, if you have an account, in your user record.',
          'Reviews: the rating, the comment, your name and profile photo, and the date. They are public and appear on the app page.',
          'Usage counters: number of views and of clicks on "Open" or "Download" per app. They are aggregated and do not identify you.',
          'Technical data: device and browser type, detected locally to show you the right install guide. Not sent to our servers.',
        ],
        'We do not collect location, contacts, device files or payment data.',
      ],
    },
    {
      id: 'purposes',
      title: 'What we use the data for',
      paragraphs: [
        [
          'Creating and managing your account and keeping you signed in.',
          'Showing your reviews and calculating each app’s average rating.',
          'Adapting the "How to install" guide and Home suggestions to your devices and interests.',
          'Ranking apps by popularity based on aggregated counters.',
          'Preventing abuse, such as fake reviews or counter manipulation.',
          'Complying with legal obligations and responding to requests from competent authorities.',
        ],
        'The legal basis is the performance of the service you request by using {name}, our legitimate interest in keeping it secure and, for preferences, your consent, which you can withdraw at any time.',
      ],
    },
    {
      id: 'local-storage',
      title: 'Data stored in your browser',
      paragraphs: [
        '{name} stores in your browser (localStorage and sessionStorage) your chosen theme, language, device and interest preferences, and a marker of which apps you have already visited in this session, so the same view is not counted twice.',
        'We do not use our own tracking or advertising cookies. You can delete this data at any time by clearing the site data in your browser.',
      ],
    },
    {
      id: 'sharing',
      title: 'Who we share data with',
      paragraphs: [
        'We do not sell your data. We share it only with:',
        [
          'Google Firebase (Authentication, Firestore and Hosting), which hosts authentication, the database and the site. Google processes this data as a processor under its own terms and privacy policy.',
          'The creators and external services that "Open" or "Download" links take you to. From that point their privacy policy applies, not ours.',
          'Authorities, when required by law.',
        ],
        'Data may be processed on servers outside your country, in Google’s data centres, with the safeguards provided by applicable law.',
      ],
    },
    {
      id: 'retention',
      title: 'How long we keep data',
      paragraphs: [
        'Account data and reviews are kept for as long as the account exists. Deleting a review removes it immediately. When you request account deletion, we delete the user record and associated reviews within 30 days, unless the law requires retention.',
        'Aggregated view and click counters contain no personal data and are kept indefinitely.',
      ],
    },
    {
      id: 'rights',
      title: 'Your rights',
      paragraphs: [
        'You have the right to access your data, correct it, request its deletion, restrict or object to processing, and request portability, under applicable law.',
        'You can edit or delete your reviews and change your preferences directly in the app. To delete your account or exercise another right, write to {email}. We reply within 30 days.',
        'If you believe your rights are not being respected, you can lodge a complaint with the competent data protection authority.',
      ],
    },
    {
      id: 'security',
      title: 'Security',
      paragraphs: [
        'We use encrypted connections (HTTPS), authentication managed by Firebase and database access rules that prevent one user from reading or changing another user’s data. No system is completely secure; if we detect an incident affecting your data, we will inform you as required by law.',
      ],
    },
    {
      id: 'children',
      title: 'Children',
      paragraphs: [
        'The service is not intended for children under 13 and we do not knowingly collect data from children. If you learn that a child has created an account, contact us so we can delete it.',
      ],
    },
    {
      id: 'changes',
      title: 'Changes to this policy',
      paragraphs: [
        'We may update this policy to reflect changes in the service or in the law. The date of the last revision is shown at the top of the page. Significant changes will be announced in the service.',
      ],
    },
  ],
}

export const LEGAL = {
  pt: { terms: PT_TERMS, privacy: PT_PRIVACY },
  en: { terms: EN_TERMS, privacy: EN_PRIVACY },
}

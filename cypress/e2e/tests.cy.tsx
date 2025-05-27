// Повторяющиеся селекторы
const SELECTORS = {
  userApi: '/api/auth/user',
  ingredientsApi: '/api/ingredients',
  orderApi: '/api/orders',
  userNameInput: 'input[name="name"]',
  testUserName: 'Test User',
  profileUrlPart: '/profile',
  homeUrl: 'http://localhost:4000/',
  bunName: 'Флюоресцентная булка R2-D3',
  fillingName: 'Биокотлета из марсианской Магнолии',
  bunOption: 'Краторная булка',
  bunPlaceholder: 'Выберите булки',
  fillingPlaceholder: 'Выберите начинку',
  orderButton: 'Оформить заказ',
  orderConfirmationText: 'идентификатор заказа',
  constructorTitle: 'Соберите бургер',
  personalCabinet: 'Личный кабинет',
};

describe('Авторизация и профиль', () => {
  it('Переход в профиль после входа', () => {
    cy.intercept('GET', SELECTORS.userApi, {
      statusCode: 200,
      body: {
        success: true,
        user: {
          email: 'test_user@example.com',
          name: SELECTORS.testUserName,
        }
      }
    }).as('getUser');

    cy.loginByApi();
    cy.visit('/');
    cy.contains(SELECTORS.personalCabinet).click();
    cy.wait('@getUser');

    cy.contains(SELECTORS.testUserName).click();
    cy.url().should('include', SELECTORS.profileUrlPart);
    cy.get('form', { timeout: 10000 }).should('exist');
    cy.get(SELECTORS.userNameInput).should('have.value', SELECTORS.testUserName);
  });
});

describe('Функциональность конструктора бургеров', () => {
  beforeEach(() => {
    cy.fixture('ingredients.json').as('ingredientsData');
    cy.fixture('user.json').as('userData');

    cy.intercept('GET', SELECTORS.ingredientsApi, {
      fixture: 'ingredients.json'
    }).as('getIngredients');

    cy.intercept('GET', SELECTORS.userApi, {
      fixture: 'user.json'
    }).as('getUser');

    cy.setCookie('accessToken', 'mockToken');
    cy.window().then(win => {
      win.localStorage.setItem('refreshToken', 'mockToken');
    });

    cy.visit('/');
    cy.contains(SELECTORS.constructorTitle, { timeout: 10000 }).should('exist');
  });

  it('Нет булки при старте', () => {
    cy.contains(SELECTORS.bunPlaceholder).should('exist');
    cy.contains(SELECTORS.fillingPlaceholder).should('exist');
  });

  it('Добавление булки в конструктор', () => {
    cy.contains(SELECTORS.bunName).next().click();
    cy.contains(SELECTORS.bunName, { timeout: 10000 }).should('exist');
  });

  it('Добавление начинки в конструктор', () => {
    cy.contains('Начинки').scrollIntoView().click({ force: true });
    cy.contains(SELECTORS.fillingName).next().click();
    cy.contains(SELECTORS.fillingName).should('exist');
  });

  it('Добавление ингредиентов в заказ и очистка конструктора', () => {
    cy.intercept('POST', SELECTORS.orderApi, {
      fixture: 'makeOrder.json',
      statusCode: 200
    }).as('newOrder');

    cy.contains(SELECTORS.bunName).next().click();
    cy.contains('Начинки').scrollIntoView();
    cy.contains(SELECTORS.fillingName).next().click();

    cy.contains(SELECTORS.orderButton).should('not.be.disabled').click();
    cy.wait('@newOrder', { timeout: 30000 })
      .its('response.statusCode')
      .should('eq', 200);

    cy.contains(SELECTORS.orderConfirmationText).should('be.visible');
    cy.get('body').type('{esc}');
    cy.contains(SELECTORS.bunPlaceholder).should('exist');
  });

  it('Открытие и закрытие модального окна ингредиента', () => {
    cy.contains(SELECTORS.bunOption).click();
    cy.url().should('include', '/ingredients/');
    cy.get('body').type('{esc}');
    cy.url().should('eq', SELECTORS.homeUrl);
  });

  it('Закрытие модального окна через клик на оверлей', () => {
    cy.contains(SELECTORS.bunOption).click();
    cy.get('body').click(10, 10);
    cy.url().should('eq', SELECTORS.homeUrl);
  });
});

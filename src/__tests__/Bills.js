/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/dom';
import BillsUI from '../views/BillsUI.js';
import { bills } from '../fixtures/bills.js';
import { ROUTES, ROUTES_PATH } from '../constants/routes.js';
import { localStorageMock } from '../__mocks__/localStorage.js';

import BillsContainer from '../containers/Bills';
import mockStore from '../__mocks__/store';
import userEvent from '@testing-library/user-event';

import router from '../app/Router.js';

jest.mock('../app/Store', () => mockStore);

describe('Given I am connected as an employee', () => {
  describe('When I am on Bills Page', () => {
    test('Then bill icon in vertical layout should be highlighted', async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
        })
      );
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId('icon-window'));
      const windowIcon = screen.getByTestId('icon-window');
      expect(windowIcon.className).toBe('active-icon');
    });

    test('Then bills should be ordered from earliest to latest', () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      dates.sort(antiChrono);
      const datesSorted = [...dates];
      expect(dates).toEqual(datesSorted);
    });
  });

  describe('When I am on Bills Page and i click on icon Eye of bill', () => {
    test('Then modal with supporting documents appears', () => {
      $.fn.modal = jest.fn(); // Prevent jQuery error, simulated function
      const onNavigate = (pathname) => {
        //Same as dashboard
        document.body.innerHTML = ROUTES({ pathname }); //Same as dashboard
      };

      Object.defineProperty(window, 'localStorage', { value: localStorageMock }); //Same as dashboard
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' })); //Same as dashboard

      const billsContainer = new BillsContainer({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      }); //Same as dashboard, we give data for the class object

      const iconEye = screen.getAllByTestId('icon-eye')[0]; //select first element with id icon-eye
      const handleShowModalFile = jest.fn((e) => {
        billsContainer.handleClickIconEye(e.target);
      }); //Same as Dashboard, simulated function

      iconEye.addEventListener('click', handleShowModalFile); //add Event listener on the element with id icon-eye
      userEvent.click(iconEye); //user click on the element

      expect(handleShowModalFile).toHaveBeenCalled(); //we expect the function was called
      expect(screen.getAllByText('Justificatif')).toBeTruthy(); //we expect the modal open and the text be Justificatif
    });
  });

  describe('When I am on Bills Page and click on new Bills', () => {
    test('Then editable form new bill appears', () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      Object.defineProperty(window, 'localStorage', { value: localStorageMock }); //same as Dashboard
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' })); //same as dashboard

      const billsContainer = new BillsContainer({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      }); //Same as dashboard, we give data for the class object

      const handleShowModalNewBill = jest.fn((e) => billsContainer.handleClickNewBill(e)); //Same as Dashboard, simulated function
      const btnNewBill = screen.getByTestId('btn-new-bill'); //select first element with id icon-eye

      btnNewBill.addEventListener('click', handleShowModalNewBill); //add Event listener on the element with id icon-eye
      userEvent.click(btnNewBill); //user click on the element
      expect(handleShowModalNewBill).toHaveBeenCalled(); //we expect function be called
      expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy(); //we expect text change and be Envoyer une note de frais
    });
  });
});

// Test d'integration GET
describe('Given I am connected as an employee', () => {
  describe('When I am on Bills Page', () => {
    test('fetches bills from mock API GET', async () => {
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);

      expect(await waitFor(() => screen.getByText('Mes notes de frais'))).toBeTruthy();
      expect(await waitFor(() => screen.getByTestId('tbody'))).toBeTruthy();
    });
  });
  describe('When an error occurs on API', () => {
    beforeEach(() => {
      jest.spyOn(mockStore, 'bills');
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: 'a@a' }));
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      router();
    });

    test('fetches bills from an API and fails with 404 message error', async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error('Erreur 404'));
          },
        };
      });
      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);
      const message = await waitFor(() => screen.getByText(/Erreur 404/));
      expect(message).toBeTruthy();
    });

    test('fetches messages from an API and fails with 500 message error', async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error('Erreur 500'));
          },
        };
      });

      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);
      const message = await waitFor(() => screen.getByText(/Erreur 500/));
      expect(message).toBeTruthy();
    });
  });
});

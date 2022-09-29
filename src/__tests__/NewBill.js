/**
 * @jest-environment jsdom
 */

//import { screen, waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event';
import mockStore from '../__mocks__/store';
import { localStorageMock } from '../__mocks__/localStorage';
import { ROUTES_PATH } from '../constants/routes.js';
import NewBill from '../containers/NewBill';
import Router from '../app/Router';
import formatPicture from '../containers/NewBill';

//import BillsContainer from "../containers/Bills"
//import router from "../app/Router.js";
//import BillsUI from "../views/BillsUI.js"
import { fireEvent, screen, waitFor } from '@testing-library/dom';

describe('Given I am connected as an employee', () => {
  describe('When I am on NewBill Page', () => {
    test('Then mail icon in vertical layout should be highlighted', () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      Object.defineProperty(window, 'location', { value: { hash: ROUTES_PATH['NewBill'] } });

      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));
      document.body.innerHTML = `<div id="root"></div>`;
      Router();

      const icon = screen.getByTestId('icon-mail');
      expect(icon.className).toBe('active-icon');
    });
  });

  describe('When I am on NewBill Page and i click on button chose a file', () => {
    test('Then i can choose to upload a file with good extension (jpg|jpeg|png)', async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      Object.defineProperty(window, 'location', { value: { hash: ROUTES_PATH['NewBill'] } });

      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));
      document.body.innerHTML = `<div id="root"></div>`;
      Router();

      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
      const inputFile = screen.getByTestId('file');

      const img = new File(['img'], 'image.png', { type: 'image/png' });

      inputFile.addEventListener('change', handleChangeFile);
      await waitFor(() => {
        userEvent.upload(inputFile, img);
      });

      expect(handleChangeFile).toBeCalled();
      expect(screen.getAllByText('Billed')).toBeTruthy();
      const icon = screen.getByTestId('icon-mail');
      expect(icon.className).toBe('active-icon');
      expect(formatPicture).not.toBe(0);
    });
    test('Then i can choose to upload a file with bad extension', async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      Object.defineProperty(window, 'location', { value: { hash: ROUTES_PATH['NewBill'] } });

      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));
      document.body.innerHTML = `<div id="root"></div>`;
      Router();

      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
      const inputFile = screen.getByTestId('file');

      const img = new File(['img'], 'image.pdf', { type: 'image/pdf' });

      inputFile.addEventListener('change', handleChangeFile);
      await waitFor(() => {
        userEvent.upload(inputFile, [img]);
      });

      expect(formatPicture).not.toBe(1);
    });
  });

  // Test d'integration POST
  describe('Given i am connected as an employee', () => {
    describe('When I am on NewBills Page', () => {
      test('send bills to API, method POST', async () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock });
        Object.defineProperty(window, 'location', { value: { hash: ROUTES_PATH['NewBill'] } });

        window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));
        document.body.innerHTML = `<div id="root"></div>`;
        Router();

        const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });
        const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));

        const inputType = screen.getByTestId('expense-type');
        const inputName = screen.getByTestId('expense-name');
        const inputDate = screen.getByTestId('datepicker');
        const inputAmount = screen.getByTestId('amount');
        const inputVat = screen.getByTestId('vat');
        const inputPct = screen.getByTestId('pct');
        const inputComment = screen.getByTestId('commentary');
        const inputFile = screen.getByTestId('file');
        const img = new File(['img'], 'image.png', { type: 'image/png' });

        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));

        inputType.value = 'Transports';
        inputName.value = 'Vol Toulouse Paris';
        inputDate.value = '2022-01-25';
        inputAmount.value = '120';
        inputVat.value = 70;
        inputPct.value = 20;
        inputComment.value = 'Diner professionnel';
        inputFile.addEventListener('change', handleChangeFile);
        await waitFor(() => {
          userEvent.upload(inputFile, [img]);
        });

        expect(inputType.validity.valid).toBeTruthy();
        expect(inputName.validity.valid).toBeTruthy();
        expect(inputDate.validity.valid).toBeTruthy();
        expect(inputAmount.validity.valid).toBeTruthy();
        expect(inputVat.validity.valid).toBeTruthy();
        expect(inputPct.validity.valid).toBeTruthy();
        expect(inputComment.validity.valid).toBeTruthy();
        expect(inputFile.files[0]).toBeDefined();

        const formulaire = screen.getByTestId('form-new-bill');
        expect(formulaire).toBeTruthy;
        formulaire.addEventListener('submit', handleSubmit);

        fireEvent.submit(formulaire);
        expect(handleSubmit).toHaveBeenCalled();
      });
    });
  });
});

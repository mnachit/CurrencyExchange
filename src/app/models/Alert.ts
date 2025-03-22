
export class Alert {

    id?: string;

    type?: 'success' | 'info' | 'warning' | 'danger';

    message?: string;

    autoClose?: boolean;

    keepAfterRouteChange?: boolean;

    fade?: boolean;

}

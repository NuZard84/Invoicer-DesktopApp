export namespace main {
	
	export class Item {
	    description: string;
	    amount: number;
	
	    static createFrom(source: any = {}) {
	        return new Item(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.description = source["description"];
	        this.amount = source["amount"];
	    }
	}
	export class Invoice {
	    invoiceNo: string;
	    customerName: string;
	    customerAddress: string;
	    items: Item[];
	    total: number;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    invoiceDate: any;
	    isPaid: boolean;
	    companyName: string;
	    paidAmount: number;
	    tdsAmount: number;
	    transactionType: string;
	
	    static createFrom(source: any = {}) {
	        return new Invoice(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.invoiceNo = source["invoiceNo"];
	        this.customerName = source["customerName"];
	        this.customerAddress = source["customerAddress"];
	        this.items = this.convertValues(source["items"], Item);
	        this.total = source["total"];
	        this.createdAt = this.convertValues(source["createdAt"], null);
	        this.invoiceDate = this.convertValues(source["invoiceDate"], null);
	        this.isPaid = source["isPaid"];
	        this.companyName = source["companyName"];
	        this.paidAmount = source["paidAmount"];
	        this.tdsAmount = source["tdsAmount"];
	        this.transactionType = source["transactionType"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class InvoiceData {
	    invoiceNo: string;
	    customerName: string;
	    total: number;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    invoiceDate: any;
	    isPaid: boolean;
	    paidAmount: number;
	    tdsAmount: number;
	
	    static createFrom(source: any = {}) {
	        return new InvoiceData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.invoiceNo = source["invoiceNo"];
	        this.customerName = source["customerName"];
	        this.total = source["total"];
	        this.createdAt = this.convertValues(source["createdAt"], null);
	        this.invoiceDate = this.convertValues(source["invoiceDate"], null);
	        this.isPaid = source["isPaid"];
	        this.paidAmount = source["paidAmount"];
	        this.tdsAmount = source["tdsAmount"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class InvoiceInput {
	    invoiceNo: string;
	    invoiceDate: string;
	    customerName: string;
	    customerAddress: string;
	    items: Item[];
	    total: number;
	    transactionType: string;
	
	    static createFrom(source: any = {}) {
	        return new InvoiceInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.invoiceNo = source["invoiceNo"];
	        this.invoiceDate = source["invoiceDate"];
	        this.customerName = source["customerName"];
	        this.customerAddress = source["customerAddress"];
	        this.items = this.convertValues(source["items"], Item);
	        this.total = source["total"];
	        this.transactionType = source["transactionType"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}


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
	    invoiceNumber: number;
	    serialNumber: number;
	    customerName: string;
	    customerAddress: string;
	    items: Item[];
	    total: number;
	    // Go type: time
	    createdAt: any;
	
	    static createFrom(source: any = {}) {
	        return new Invoice(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.invoiceNumber = source["invoiceNumber"];
	        this.serialNumber = source["serialNumber"];
	        this.customerName = source["customerName"];
	        this.customerAddress = source["customerAddress"];
	        this.items = this.convertValues(source["items"], Item);
	        this.total = source["total"];
	        this.createdAt = this.convertValues(source["createdAt"], null);
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


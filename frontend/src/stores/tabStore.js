import { defineStore } from 'pinia'

export const useTabStore = defineStore('shipmentTabs', {
 state: () => ({
   activeTab: 'Shipments',

   tabs: [
     {
       name:'Shipments',
       label:'Shipments',
       route:'/shipments',
       closable:false
     }
   ],
   }),
 actions:{
   setActiveTab(name) {
     this.activeTab = name;
   },
   openAddShipment() {
     const exists = this.tabs.find(t => t.name === 'add')
     if (!exists) {
       this.tabs.push({
         name:'add',
         label:'Add Shipment',
        route: '/shipments',
         closable:true
       })
     }
      this.activeTab = 'add'
   },
   openShipmentDetails(shipment) {
     const id = shipment?.id ?? shipment
     if (!id) return
     const name = `details-${id}`
     const exists = this.tabs.find(t => t.name === name)
     if (!exists) {
      this.tabs.push({
         name,
         label: `Shipment ${id}`,
         route: `/shipments/${id}`,
         closable:true
     
      })
     }
      this.activeTab = name
      
   },
   closeTab(name) {
     this.tabs = this.tabs.filter(t => t.name !== name)
     this.activeTab = 'Shipments'
   },
   // Shipments actions
   closeShipmentTab() {
     this.closeTab('add');
   },
    closeShipmentDetailsTab(name) {
      this.closeTab(name);
    }
 },
})

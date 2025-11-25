
// frontend/src/types.ts
export interface Marca {
  id: string;
  nombre: string;
}

export interface Categoria {
  id: string;
  nombre: string;
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  principio_activo: string;
  concentracion: string;
  presentacion: string;
  precio_venta: number;
  stock_minimo: number;
  stock_total: number;
  estado: boolean;
  marca: Marca | null;
  categoria: Categoria | null;
}

export interface DecodedToken {
  email: string;
  sub: string;
  roles: string[];
}

export interface AlertaStock {
  id: string;
  producto: Producto;
  tipo_alerta: string;
  mensaje: string;
  fecha: Date | string;
}

export interface Cliente {
  id: string;
  tipo_documento: string;
  numero_documento: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  direccion: string;
  email: string;
  estado: boolean;
  fecha_creacion: Date | string;
  fecha_actualizacion: Date | string;
}

export interface Proveedor {
  id: string;
  razon_social: string;
  ruc: string;
  direccion: string;
  telefono: string;
  email: string;
  representante: string;
  estado: boolean;
  fecha_creacion: Date | string;
  fecha_actualizacion: Date | string;
}

export interface Lote {
  id: string;
  numero_lote: string;
  fecha_vencimiento: Date | string;
  stock: number;
}

export interface VentaDetalle {
  id: string;
  producto: Producto;
  lote: Lote | null;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  descuento: number;
}

export interface Venta {
  id: string;
  cliente: Cliente | null;
  tipo_comprobante: string;
  numero_serie: string;
  numero_correlativo: string;
  fecha_venta: Date | string;
  subtotal: number;
  impuestos: number;
  total: number;
  metodo_pago: string;
  estado: boolean;
  detalles: VentaDetalle[];
}

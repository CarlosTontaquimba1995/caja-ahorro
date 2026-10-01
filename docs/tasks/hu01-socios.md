# ESPECIFICACIÓN TÉCNICA ABSOLUTA: HU-01 - GESTIÓN ÚNICA DE SOCIOS

## CONTEXTO GLOBAL DE EJECUCIÓN
- Frameworks: NestJS 12.x (Backend) | Angular 21.x (Frontend)
- Base de Datos: PostgreSQL mediante Prisma ORM 8 (Usa Agent Skills nativos)
- Estilos: Tailwind CSS Minimalista Moderno
- Reglas Core: Clean Code Estricto (SRP, KISS, DRY, Nombres descriptivos, sin nulls)

---

## PARTE 1: CAPA DE DATOS & BACKEND (NestJS 12 + Prisma)

### 1. Modelo de Base de Datos relacional (`backend/prisma/schema.prisma`)
Agrega el siguiente modelo relacional exacto. Queda prohibido cambiar los nombres de las columnas.
```prisma
model Partner {
  id        String   @id @default(uuid()) @db.Uuid
  number    Int      @unique // Número secuencial de socio para la reunión (1, 2, 3...)
  dni       String   @unique @db.VarChar(10) // Cédula de identidad (Longitud exacta de 10)
  firstName String   @db.VarChar(100)
  lastName  String   @db.VarChar(100)
  partnerType String @default("TITULAR") // Parámetro: TITULAR, DEPENDIENTE, etc.
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now()) @db.Timestamp()
  updatedAt DateTime @updatedAt @db.Timestamp()

  @@index([dni])
  @@index([number])
}
```

### 2. Contrato de Entrada - DTO (`backend/src/partners/dto/create-partner.dto.ts`)
Fuerte validación mediante `class-validator`. Prohibidos tipos laxos.
- `number`: `@IsInt()`, `@IsPositive()`, obligatorio.
- `dni`: `@IsString()`, `@Matches(/^[0-9]{10}$/, { message: "DNI_MUST_BE_10_DIGITS" })`, obligatorio.
- `firstName`: `@IsString()`, `@Length(2, 100)`, obligatorio.
- `lastName`: `@IsString()`, `@Length(2, 100)`, obligatorio.
- `partnerType`: `@IsString()`, `@IsNotEmpty()`, obligatorio.

### 3. Algoritmo del Servicio (`backend/src/partners/partners.service.ts`)
- **Firma:** `async create(dto: CreatePartnerDto): Promise<Partner>`
- **Flujo feliz e imperativo:**
  1. Consultar en la base de datos si existe algún `Partner` donde `dni` sea igual a `dto.dni` O `number` sea igual a `dto.number`.
  2. SI el registro existe: Lanzar inmediatamente `ConflictException('PARTNER_OR_NUMBER_ALREADY_EXISTS')`.
  3. NO existe: Insertar el nuevo `Partner` mapeando el DTO.
  4. Retornar el objeto `Partner` creado.
- **Manejo de Errores:** Capturar fallos inesperados de conexión con bloques `try/catch` y lanzar `InternalServerErrorException`. No retornar códigos numéricos.

### 4. Controlador (`backend/src/partners/partners.controller.ts`)
- Endpoint: `POST /api/partners`
- Retorno explícito: `Promise<Partner>`
- Endpoint: `GET /api/partners` (Retorna `Promise<Partner[]>` con todos los socios ordenados por `number` de forma ascendente).

---

## PARTE 2: CAPA VISUAL & INTERFAZ (Angular 21 + Tailwind)

### 1. Servicio del Frontend (`frontend/src/app/core/services/partners.service.ts`)
- Inyección moderna: `private http = inject(HttpClient);`
- Retornos fuertemente tipados usando RxJS 7.x:
  - `getPartners(): Observable<Partner[]>` apuntando a `/api/partners`
  - `createPartner(partner: CreatePartnerInput): Observable<Partner>`

### 2. Componente de Listado Minimalista (`frontend/src/app/features/partners/partner-list/`)
- Configuración: `standalone: true`, importaciones de `CommonModule`.
- Reactividad con Signals:
  - `partners = signal<Partner[]>([]);`
  - `isLoading = signal<boolean>(false);`
- Control de Flujo Semántico (Angular Moderno):
  - Usa `@if (isLoading())` para renderizar un esqueleto de carga.
  - Usa `@for (partner of partners(); track partner.id)` para iterar la tabla. **Prohibido usar `*ngFor`**.

### 3. Estética de la Interfaz UI/UX (Paleta de Colores de la Línea Gráfica)
Sigue estas clases de Tailwind exactas para lograr el acabado profesional solicitado:
- **Contenedor Principal:** Tarjeta de fondo blanco con bordes ultra suavizados y sombra sutil (`bg-white shadow-sm border border-slate-100 rounded-2xl p-6`).
- **Botón de Agregar Socio:** Ubicado en la esquina superior derecha, color naranja corporativo con transición suave (`bg-brand-primary text-white rounded-xl px-4 py-2.5 font-medium transition-all duration-200 hover:opacity-90 active:scale-[0.98]`).
- **Encabezados de Tabla:** Fondo gris limpio con tipografía oscura, clara y espaciada (`bg-slate-50 text-slate-500 font-semibold tracking-wider p-4 text-left text-xs uppercase`).
- **Filas de la Tabla:** Espaciado generoso (`p-4 border-b border-slate-100 hover:bg-slate-50/50 transition-colors`). El número de socio debe destacarse en azul corporativo (`text-brand-secondary font-bold`).

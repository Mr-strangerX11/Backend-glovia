# TODO - Marketplace QA/Test & Email/Vendor Privacy Enhancements

## Phase 1: Vendor order email privacy
- [ ] Update vendor email payload to remove customer delivery address.
- [ ] Update vendor email HTML template to stop rendering address fields.
- [ ] Keep customer confirmation + admin email unchanged (full address allowed).

## Phase 2: Vendor profile product filtering
- [ ] Confirm product visibility rule: show all products for `product.vendorId` regardless of uploader role (admin/superadmin/vendor).
- [ ] If current behavior leaks non-matching vendorId products, fix vendors service query.

## Phase 3: Add security/privacy e2e tests
- [ ] Add e2e test: placing an order triggers vendor email.
- [ ] Assert vendor email HTML contains customerName/email/phone and product rows, but **does not contain** address fields.
- [ ] Assert admin email HTML contains address fields.

## Phase 4: Run regression suites
- [ ] Run `npx jest --config ./test/jest-e2e.json --runInBand test/e2e/security`
- [ ] Run full build/tests: `npm test` or repo scripts


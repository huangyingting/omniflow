import '../scripts/environment';

async function main() {
  console.log(
    'OmniFlow AI zero-dummy-data policy: Skipping demo user and project seeding. Use `npm run bootstrap:admin` to provision the initial administrator account.'
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

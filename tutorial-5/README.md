What is the relationship between actor and task?
A task is a case of an actor's execution. Most often with predefined parameters.

What are the differences between default (unnamed) and named storage? Which one would you choose for everyday usage?
All storages are created without a name (with only an ID). If you want to preserve a storage, simply give it a name and it will be retained indefinitely. I would choose named storages for everyday use because it makes easier verifying of using the correct store.

What is the relationship between the Apify API and the Apify client? Are there any significant differences?
Apify API client allows to access from any Node.js application, while Apify API allows to access programmatically using HTTP requests. They're pretty much the same under the hood.

Is it possible to use a request queue for deduplication of product IDs? If yes, how would you do that?
Deduplication is performed automatically. If the url contains a product identifier, then deduplication will also be performed automatically for it.

What is data retention and how does it work for all types of storage (default and named)?
This is the storage of data in the chosen data storage and format. Nameless storage is stored for 14 days, named - permanently.

How do you pass input when running an actor or task via the API?
By the POST payload.

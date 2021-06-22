Actors have a Restart on error option in their Settings. Would you use this for your regular actors? Why? When would you use it, and when not?
This option is useful for a well-debugged actor with no internal bugs and if this actor has some errors, which don't related to code.

Migrations happen randomly, but by setting Restart on error and then throwing an error in the main process, you can force a similar situation. Observe what happens. What changes and what stays the same in a restarted actor run?
All in-progress processes are stopped. Unless you have saved your state, the actor run will restart and progress will be lost.

Why don't you usually need to add any special code to handle migrations in normal crawling/scraping? Is there a component that essentially solves this problem for you?
The Apify SDK persists its state automatically, using the migrating and persistState events. persistState notifies SDK components to persist their state at regular intervals in case a migration happens. The migrating event is emitted just before a migration.

How can you intercept the migration event? How much time do you need after this takes place and before the actor migrates?
By using Apify.events.on('migrating', callback). When a migration event occurs, you only have a few seconds to save your work.

When would you persist data to a default key-value store and when would you use a named key-value store?
Default key-value when the actor works locally, for a short time or it is simple and does not require a lot of computing power. Named key-value store is better to use for long or expensive work of the actor on the platform.

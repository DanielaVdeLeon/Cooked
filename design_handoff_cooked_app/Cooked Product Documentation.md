# Product summary 

Cooked is a public, mobile-first recipe library that provides a fast and uncluttered way to discover, search, view, cook, and annotate recipes collected from websites, social platforms, and personal sources.

Anyone can browse, search, filter, and view published recipes without creating an account.

Authenticated users with content-management permission can add, edit, and delete recipes, tags, and recipe notes. Authenticated users can also favourite recipes and manage their own account settings.

The interface follows the **Cooked Design System** (paper-scrapbook visual language: textured paper cards, hard offset shadows, tiny rotations, retro line illustrations). The design system documentation and interactive prototype are the visual and behavioural source of truth for build.

# User types

## **Public visitor**

A public visitor does not need an account.

Public visitors can:

* View the recipe homepage.  
* Browse recipe cards.  
* Search recipes.  
* Filter and sort recipes.  
* Open full recipe pages.  
* View ingredients, instructions, tags, source information, and published notes.

Public visitors cannot:

* Add recipes.  
* Edit recipes.  
* Delete recipes.  
* Add notes.  
* Edit notes.  
* Delete notes.  
* Create or manage tags.  
* Favourite recipes or use the “Favourites first” sort.  
* Access content-management pages or account settings.

## **Authenticated editor**

An authenticated editor has permission to manage Cooked content.

Authenticated editors can:

* Perform all public visitor actions.  
* Add recipes.  
* Edit recipes.  
* Delete recipes.  
* Upload and replace recipe images.  
* Create and assign tags.  
* Add recipe notes.  
* Edit recipe notes.  
* Delete recipe notes.  
* Favourite and unfavourite recipes.  
* Sort by “Favourites first” and clear all favourites.  
* Manage account settings (name, email, password, account deletion).

## **Administrator**

An administrator may perform all editor actions and manage editor access.

For the MVP, the administrator role may be managed directly through the application’s authentication or database administration system rather than through a dedicated interface.

# Core problems

Users currently save recipes as Discord links, paper copies, and browser content. Recipes become difficult to rediscover over time.

Recipe websites are often difficult to use on mobile devices while cooking.

Users make ingredient substitutions and process changes but do not consistently record them.

During grocery ordering, users struggle to retrieve recipes and review their ingredients quickly.

# Public access requirements

The following pages are publicly accessible without authentication:

* Recipe homepage  
* Search and filter interface  
* Full recipe pages  
* Public error and empty states  
* Login page

The following pages and actions require authentication and appropriate permission:

* Add recipe page  
* Edit recipe page  
* Recipe deletion  
* Note creation  
* Note editing  
* Note deletion  
* Tag creation and management  
* Favouriting and the “Favourites first” sort  
* Account settings and administration pages

When a public visitor attempts to access a protected page or activate a protected control (for example, the favourite star), the application must direct them to the login page or display an appropriate access-denied state.

Logging in returns the user to the page they started from: logging in from a recipe page returns them to that recipe page, not the homepage. Logged-out recipe pages display a Log in action in the page header.

## **Search and discovery**

Public visitors and authenticated editors can:

* Search recipe titles.  
* Search ingredient names.  
* Search tags.  
* Filter by one or more tags.  
* Sort recipes.  
* Open matching recipes.

Search and filtering must not require an account.

Search results must include only published recipes.

Draft, archived, deleted, or otherwise unpublished recipes must not appear in public search results.

## **Recipe visibility**

Published recipes are publicly accessible.

A published recipe page may display:

* Title  
* Description  
* Image  
* Source name  
* Source link  
* Serving information  
* Preparation time  
* Cooking time  
* Ingredients  
* Instructions  
* Tags  
* Published notes  
* Creation and update information where included in the design

Edit and delete controls must be hidden from public visitors.

Hiding controls is not sufficient security. The server must independently verify authentication and permissions before allowing any content change.

## **Notes**

Published recipe notes are publicly visible on the associated recipe page.

Public visitors cannot add, edit, or delete notes.

Authenticated editors can add notes.

Each note displays:

* Note text  
* Author or display name  
* Date created  
* Edited status where applicable

Authenticated editors can edit or delete notes according to the product’s permission rules.

The product should allow:

* Editors can only modify notes they created   
* Administrators can modify all notes.

## **Authentication**

Users do not need an account to browse Cooked.

Authentication is required only for protected content-management actions.

The application must support:

* Login  
* Logout  
* Forgotten-password recovery  
* Expired-session handling

Public account registration should not automatically grant editing permission. 

Authentication MVP would be:

*  Public visitors cannot create editor accounts.  
* Editor accounts are created or invited by an administrator.  
* Only approved editor accounts receive content-management permission.

# MVP

A sensible MVP would contain:

* Anyone to browse the published recipe collection.  
* Anyone to search recipes by title, ingredient, and tag.  
* Anyone to filter and sort recipes.  
* Anyone to open and use a mobile-friendly recipe page.  
* Authenticated editors to add recipes manually.  
* Authenticated editors to upload images and add source links.  
* Authenticated editors to edit and delete recipes.  
* Authenticated editors to add, edit, and delete dated recipe notes.  
* Administrators to control who receives editing access.  
* The website to work on mobile, tablet, and desktop devices.

# Recipe structure

a recipe should contain:

* Title  
* Description or introduction  
* Hero image  
* Source URL  
* Servings  
* Preparation time  
* Cooking time  
* Total time   
* Ingredients  
* Instructions  
* Tags  
* Notes  
* Date created  
* Date updated  
* Created by  
* Last edited by

each ingredient should contain:

* quantity  
* unit  
* ingredient name

Each instruction contains:

* Order number  
* Instruction text  
* Optional section heading  
* Optional timer duration

# Navigation

The primary mobile navigation contains:

* Recipes  
* Search and filters  
* Add recipe  
* Account

Search may also be available directly from the recipe homepage.

Selecting the logo returns the user to the homepage; when already on the homepage it smooth-scrolls to the top. The account menu links to the settings page. The footer sits at the bottom of the viewport on low-content pages.

The desktop layout may use a persistent sidebar or header containing the same destinations.

# Recipe homepage

The homepage displays the shared recipe collection.

Each recipe card displays:

* Image  
* Recipe title  
* Preparation or cooking time  
* Tags  
* All ingredients   
* Users can open a recipe by selecting its card.

Users can search and filter without leaving the homepage.

The system preserves search, filter, and scroll state when a user opens a recipe and returns to the homepage.

Cards must support loading, missing-image, hover, focus, and touch states.

Card interaction model (see design system “Motion & interactivity”):

* The whole card is the tap target; tag chips and the favourite star stop propagation.  
* Desktop hover lifts and tilts the card and underlines the recipe title as a link affordance; mobile uses a subtle press state.  
* On filter, search, or sort changes, desktop re-deals the cards with a deck-shuffle animation; mobile uses a scroll-driven fade only.  
* All motion respects reduced-motion preferences.

# Recipe page

The recipe page displays:

* Title  
* Image  
* Source  
* Time and serving information  
* Ingredients  
* Instructions  
* Tags  
* Dated notes (rendered as alternating-colour paper “post-it” notes per the design system)  
* Favourite star (authenticated users, beside the title)  
* Edit action (editors only)  
* Log in action in the header when logged out  
* A concise “‹ Back” header link that underlines on hover

The mobile layout prioritises legibility, large touch targets, and minimal visual clutter.

# Add and edit recipe form

The same form component is used for creating and editing recipes. Only users with an approved editor status can access this page.

Users can:

* Enter recipe details.  
* Upload an image.  
* Add a source URL.  
* Add, remove, and reorder ingredients.  
* Add, remove, and reorder instructions.  
* Add existing tags.  
* Create new tags.  
* Save or cancel.

The title and at least one ingredient are required.

The product warns users before discarding unsaved changes.

# Search and filtering

Search matches:

* Recipe titles  
* Ingredient names  
* Tags

Search is case-insensitive and supports partial matches.

Users can filter by multiple tags. By default, recipes must match all selected tags.

Users can sort recipes by:

* Recently added  
* Favourites first (authenticated users only)  
* Recently updated  
* Alphabetical order  
* Shortest cooking time

The interface provides clear actions to remove individual filters or clear all filters.

Tag pickers must scale to an unbounded, user-generated tag list: the recipe form uses a combobox (selected chips + live search + most-used suggestions + create-new), and the filter panel uses a searchable list with selected tags pinned and the remainder sorted by usage count.

# Favourites

Favourites are per-user data. The server must scope favourite reads and writes to the session user.

* Authenticated users can favourite and unfavourite recipes from a star control on recipe cards and on the full recipe page.  
* Favouriting is confirmed with a brief star animation and success toast; the star control is hidden from public visitors, and activating it while logged out opens the login page.  
* “Favourites first” sorts favourited recipes ahead of the rest, ordered most to least recently favourited; non-favourites keep the recency order.  
* The favourites order is captured when the sort is selected: favouriting or unfavouriting while browsing must not reorder the visible list. The order refreshes only when the user selects a sort again.  
* While “Favourites first” is active and the user has favourites, a “Clear favourites” action appears beside the sort control. It requires explicit confirmation (a dialog stating the number of recipes affected) and, on confirm, removes all favourites and shows a toast. Recipes themselves are unaffected.

# Account requirements

Users can:

* Create an account.  
* Log in.  
* Log out.  
* Reset a forgotten password (token-gated via email in production).  
* Manage settings: change display name, email, and password.  
* Delete their account (requires explicit confirmation; recipes remain in the library).

Password change and account deletion must re-verify the current password server-side.

Creating, editing, or deleting recipes and notes  are  private and cannot be viewed without authentication and correct user permissions.. Recipes can still be seen and searched for without an account.

# Accessibility

The product should target WCAG 2.2 AA.

It must support:

* Keyboard navigation  
* Screen readers  
* Visible focus states  
* Sufficient colour contrast  
* Text resizing  
* Reduced motion  
* Large touch targets  
* Form labels and useful validation messages

# Responsive requirements

The product must support:

* Small mobile screens  
* Large mobile screens  
* Tablets  
* Desktop browsers

Important actions must remain accessible without hover.

# Required interface states

Designs must include:

* Loading  
* Empty library  
* No search results  
* Upload progress  
* Upload failure  
* Save failure  
* Offline connection  
* Missing image  
* Validation error  
* Unsaved changes  
* Deleted recipe  
* Expired session

The “no search results” state uses the design system’s empty-state illustration. Success confirmations use green toasts; deletions use red toasts (2.6s, bottom-centre).

# Core user flows

1. Create an account and join the shared Cooked workspace.  
2. Add a recipe manually.  
3. Find a recipe by name.  
4. Find recipes containing a specific ingredient.  
5. Filter recipes by one or more tags.  
6. Open a recipe while grocery shopping.  
7. Use a recipe while cooking.  
8. Add an alteration during cooking.  
9. Add a dated note after cooking.  
10. Edit or delete a recipe.  
11. Favourite recipes while browsing, then sort by “Favourites first”.  
12. Clear all favourites with confirmation.  
13. Update account settings or delete an account.  
14. Recover from an empty search or failed save.

# Acceptance criteria

## **AC-PUB-001: View the recipe homepage without an account**

Acceptance criteria

* A visitor can open the recipe homepage without logging in.  
* The homepage displays published recipe cards.  
* The visitor is not redirected to the login page.  
* The visitor can scroll through the recipe collection.  
* Draft, archived, deleted, and unpublished recipes are not displayed.  
* Public access does not reveal protected account or administration data.

## **AC-PUB-002: Search without an account**

Acceptance criteria

* A visitor can access and use recipe search without logging in.  
* Search matches published recipe titles.  
* Search matches published recipe ingredients.  
* Search matches published recipe tags.  
* Search is case-insensitive.  
* Search supports partial matches.  
* Search results do not contain unpublished recipes.  
* Clearing the search restores the complete published recipe collection.

## **AC-PUB-003: Filter and sort without an account**

Acceptance criteria

* A visitor can filter recipes by tag without logging in.  
* A visitor can select more than one tag.  
* A visitor can remove individual filters.  
* A visitor can clear all filters.  
* A visitor can use every publicly supported sort option.  
* Filtering and sorting include only published recipes.  
* Search, filters, and sorting work together.

## **AC-PUB-004: View a full recipe without an account**

Acceptance criteria

* A visitor can open a published recipe without logging in.  
* The recipe page displays its public title, image, ingredients, instructions, tags, time information, source information, and published notes where available.  
* The visitor does not see active edit or delete controls.  
* Opening a draft, deleted, private, or unpublished recipe URL does not expose its contents.  
* The recipe page remains usable on supported mobile and desktop devices.

## **AC-PUB-005: View recipe notes without an account**

Acceptance criteria

* A visitor can view published notes associated with a published recipe.  
* Each displayed note includes its text and creation date.  
* The author is displayed where permitted by the product’s privacy settings.  
* The visitor does not see controls for adding, editing, or deleting notes.  
* Unpublished recipes cannot have notes. 

## **AC-AUTH-001: Access protected actions**

Acceptance criteria

* A user must be authenticated before adding, editing, or deleting a recipe.  
* A user must be authenticated before adding, editing, or deleting a note.  
* Authentication alone does not grant access when the user lacks the required editor permission.  
* Permission checks are performed by the server.  
* Protected actions cannot be performed by directly calling an endpoint while logged out.  
* Protected actions cannot be performed by altering a page URL or request identifier.  
* Unauthorised attempts return an appropriate unauthenticated or forbidden response.

## **AC-AUTH-002: Public visitor attempts to add a recipe**

Acceptance criteria

* A public visitor does not see the Add Recipe action in the primary navigation.  
* If a public visitor directly opens the Add Recipe URL, the application directs them to login or displays an authentication-required state.  
* No recipe form data can be submitted successfully without authentication and editor permission.  
* After a successful login by an authorised editor, the user may be returned to the Add Recipe page.

## **AC-AUTH-003: Public visitor attempts to edit a recipe**

Acceptance criteria

* A public visitor does not see an active recipe edit control.  
* Directly opening an edit URL while logged out does not display the editable recipe form.  
* Sending an unauthenticated update request does not modify the recipe.  
* The existing public recipe remains unchanged after an unauthorised attempt.

## **AC-AUTH-004: Public visitor attempts to delete a recipe**

Acceptance criteria

* A public visitor does not see a recipe deletion control.  
* An unauthenticated deletion request is rejected.  
* A user without editor permission cannot delete a recipe.  
* A rejected deletion request leaves the recipe unchanged and publicly available.

## **AC-AUTH-005: Public visitor attempts to manage notes**

Acceptance criteria

* A public visitor does not see controls for adding, editing, or deleting notes.  
* An unauthenticated note-creation request is rejected.  
* An unauthenticated note-edit request is rejected.  
* An unauthenticated note-deletion request is rejected.  
* Rejected requests do not change existing notes.

## **AC-AUTH-006: Authenticated editor navigation**

Acceptance criteria

* An authenticated editor can see the Add Recipe navigation action.  
* An authenticated editor can see edit controls on recipes they are permitted to edit.  
* An authenticated editor can see delete controls on recipes they are permitted to delete.  
* An authenticated editor can see note-management controls.  
* Editor-only controls remain usable with keyboard, mouse, and touch input.  
* Logging out removes editor-only controls from subsequent page views.

## **AC-AUTH-007: User without editor permission**

Acceptance criteria

* A signed-in user without editor permission has the same recipe-library access as a public visitor.  
* A signed-in non-editor cannot add, edit, or delete recipes.  
* A signed-in non-editor cannot add, edit, or delete notes.  
* Editor routes and endpoints reject requests from signed-in non-editors.  
* The interface does not imply that login automatically grants editing rights.

## **AC-AUTH-008: Approved editor adds a recipe**

Acceptance criteria

* An authenticated user with editor permission can open the Add Recipe page.  
* The editor can submit a valid recipe.  
* A successfully saved and published recipe appears in the public recipe library.  
* The published recipe can be viewed by a visitor without logging in.  
* The recipe records its creator and creation date internally.  
* A failed save does not publish incomplete recipe content.

## **AC-AUTH-009: Approved editor edits a recipe**

Acceptance criteria

* An authenticated editor can open the edit form for an authorised recipe.  
* Saving valid changes updates the existing recipe.  
* Public visitors see the updated published version after the save succeeds.  
* The recipe records its last editor and updated date internally.  
* Failed or unauthorised edits do not change the public recipe.

## **AC-AUTH-010: Approved editor deletes a recipe**

Acceptance criteria

* An authenticated editor can initiate deletion for an authorised recipe.  
* Deletion requires explicit confirmation.  
* After successful deletion, the recipe no longer appears on the public homepage.  
* The recipe no longer appears in public search or filter results.  
* The previous public URL displays an unavailable or not-found state.  
* A failed deletion leaves the public recipe available.

## **AC-AUTH-011: Approved editor manages notes**

Acceptance criteria

* An authenticated editor can add a note to a recipe.  
* A successfully added published note is visible to public visitors.  
* An authenticated editor can edit a note that was created by them.   
* An authenticated editor cannot edit a note that was not created by them.   
* An authenticated editor can delete a note that was created by them.  
* An authenticated editor cannot delete a note that was not created by them.  
* Public visitors see the updated note state only after the relevant operation succeeds.  
* A failed operation does not remove or corrupt the previous public note.

## **AC-FAV-001: Favourites**

Acceptance criteria

* A public visitor does not see favourite stars or the “Favourites first” sort results for any user.  
* Activating a favourite control while logged out opens the login page and does not change any data.  
* An authenticated user can favourite and unfavourite recipes from cards and recipe pages.  
* Favourites are stored per user; one user’s favourites are never visible to, or modifiable by, another user.  
* “Favourites first” orders favourites most to least recently favourited.  
* Favouriting or unfavouriting while “Favourites first” is active does not reorder the visible list; the order refreshes only when a sort is selected again.  
* “Clear favourites” appears only when “Favourites first” is active, the user is authenticated, and they have at least one favourite.  
* Clearing favourites requires explicit confirmation, removes only favourite records, and leaves recipes unchanged.

## **AC-ACC-001: Account settings**

Acceptance criteria

* Only the authenticated account owner can open the settings page.  
* The owner can change their display name, email, and password.  
* Password change and account deletion re-verify the current password server-side.  
* Account deletion requires explicit confirmation and signs the user out; recipes remain in the library.  
* After logging in from a recipe page, the user is returned to that recipe page.

## **AC-SEC-001: Server-side authorisation**

Acceptance criteria

* Every recipe creation, update, and deletion request verifies the user’s authentication status.  
* Every recipe creation, update, and deletion request verifies the user’s editor permission.  
* Every note creation, update, and deletion request verifies the user’s authentication status.  
* Every note creation, update, and deletion request verifies the user’s editor permission.  
* Every favourite read and write is scoped to the session user.  
* Hiding an interface control is not treated as an authorisation mechanism.  
* Unauthorised requests do not return protected draft or administrative data.  
* Authorisation rules are tested at both the interface and endpoint levels.

## **AC-SEO-001: Public recipe discoverability**

Acceptance criteria

* Published recipe pages can be opened through stable public URLs.  
* Each public recipe page has a unique page title.  
* Each public recipe page has a meaningful meta description where available.  
* Draft, archived, deleted, and unpublished recipes are excluded from public indexing.  
* Public recipe content is available in the initial rendered page or through an agreed search-engine-compatible rendering strategy.  
* Canonical URLs are defined where multiple URLs could display the same recipe.

## **AC-E2E-001: Public visitor journey**

Scenario

Given a visitor does not have an account,  
when they open Cooked, search for an ingredient, filter the results, and open a recipe,  
then they can complete the entire discovery and viewing journey without being asked to log in.

## **AC-E2E-002: Protected editor journey**

Scenario

Given an approved editor is logged in,  
when they add and publish a recipe,  
then the recipe appears in the public recipe library and can be viewed by a logged-out visitor.

## **AC-E2E-003: Unauthorised modification attempt**

Scenario

Given a visitor is logged out or lacks editor permission,  
when they attempt to create, edit, or delete a recipe or note,  
then the request is rejected and no content is changed.

